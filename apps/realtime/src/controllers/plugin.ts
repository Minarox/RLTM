import {
    createOrUpdateMatch,
    createOrUpdatePlayer,
    createOrUpdateStatistic,
    getSlotByToken,
    saveMatchResult
} from "@rltm/db";
import {
    PLUGIN_PROTOCOL,
    Topic,
    type MatchPayload,
    type PluginCommand,
    type PluginInfoPayload,
    type ResponsePayload,
    type ResultPayload,
    type ScoreboardPayload
} from "@rltm/shared";
import { Elysia } from "elysia";
import logger from "../extensions/logger.ts";
import { registerPlugin, unregisterPlugin } from "../live/plugins.ts";
import {
    clearPluginStates,
    getSlotLive,
    publishSlot,
    refreshSlot,
    refreshSlotMatch,
    refreshTournament,
    setEntities,
    setSlotState,
    type SlotLive
} from "../live/store.ts";
import { findPlayer, getReplayNameCommand, getStatisticValues } from "../plugin/utils.ts";

interface Connection {
    slotId: string;
    tournamentId: string;
    // plugin message received at the connection, null for a plugin older than the protocol 2
    plugin: PluginInfoPayload | null;
    warned: boolean;
    // Match of the database the scoreboard is saved in, and its versus
    matchId: number | null;
    versusId: number | null;
    // Last replay name sent to the game
    replayName: string | null;
    close: () => void;
}

const connections = new Map<string, Connection>();

// Last result received for each slot: the plugin sends it again on each connection
const lastResults = new Map<string, string>();

function getToken(data: any): string | undefined {
    const query = data?.query?.['token'];
    if (typeof query === "string" && query) return query;

    const authorization = data?.headers?.['authorization'];
    if (typeof authorization === "string" && authorization.startsWith("Bearer ")) {
        return authorization.slice("Bearer ".length).trim() || undefined;
    }

    return undefined;
}

// Slot of the token of the plugin, if it is enabled and in the store
function getSlotOfToken(data: any): SlotLive | undefined {
    const token = getToken(data);
    const slot = token ? getSlotByToken(token) : undefined;
    return slot?.enabled ? getSlotLive(slot.tournamentId, slot.id) : undefined;
}

// Slot of the connection, if it is still the plugin of the slot
function getSlotOfConnection(connectionId: string, connection: Connection): SlotLive | undefined {
    const slotLive = getSlotLive(connection.tournamentId, connection.slotId);
    return slotLive?.pluginConnectionId === connectionId ? slotLive : undefined;
}

function isObject(value: unknown): value is { [key: string]: any } {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sendCommand(ws: any, command: PluginCommand): void {
    logger.debug(`🎮 Send command "${command.command}" to the game`);
    ws.send(JSON.stringify(command));
}

// The results of the tournament and the score of the versus change at the end of a match
function onMatchEnded(connection: Connection): void {
    refreshTournament(connection.tournamentId);
    refreshSlot(connection.slotId);
}

function saveScoreboard(slotLive: SlotLive, matchId: number, scoreboard: ScoreboardPayload): void {
    Object.values(scoreboard).forEach((playerData) => {
        if (!isObject(playerData) || typeof playerData.uid !== "string" || typeof playerData.name !== "string") return;

        const playerFound = createOrUpdatePlayer({
            uid: playerData.uid,
            name: playerData.name,
            bot: Boolean(playerData.bot),
            teamIndex: playerData.teamIndex,
            // carId is only in the players topic
            carId: findPlayer(slotLive.players, playerData)?.carId
        });
        if (playerFound) {
            createOrUpdateStatistic(getStatisticValues(playerData), matchId, playerFound.id);
        }
    });
}

// Name the replay of the game with the teams of the versus, sent again when the teams or the game change
function updateReplayName(ws: any, connection: Connection, slotLive: SlotLive): void {
    if (!slotLive.versus || !slotLive.game || slotLive.game.isEnded) return;

    const command = getReplayNameCommand(slotLive.versus, slotLive.players);
    if (!command) return;

    const replayName = `${slotLive.game.guid}|${JSON.stringify(command.payload)}`;
    if (replayName === connection.replayName) return;

    connection.replayName = replayName;
    sendCommand(ws, command);
}

function onPlugin(connection: Connection, slotLive: SlotLive, payload: unknown): void {
    if (!isObject(payload)) return;
    const plugin = payload as PluginInfoPayload;

    connection.plugin = plugin;
    if (plugin.protocol !== PLUGIN_PROTOCOL) {
        logger.warn(`⚠️ RLTM Bridge ${plugin.version} uses the protocol ${plugin.protocol}, RLTM supports the protocol ${PLUGIN_PROTOCOL}: update ${plugin.protocol < PLUGIN_PROTOCOL ? 'the plugin' : 'RLTM'}.`);
        return;
    }

    logger.info(`🎮 RLTM Bridge ${plugin.version} connected from "${plugin.client}" on slot "${slotLive.slot.name}".`);
    setSlotState(slotLive, Topic.PLUGIN, plugin);
}

function onMatch(ws: any, connection: Connection, slotLive: SlotLive, payload: unknown): void {
    const game = isObject(payload) ? payload as MatchPayload : null;
    slotLive.game = game;

    if (!game) {
        connection.matchId = null;
        connection.replayName = null;
    } else if (slotLive.versus) {
        if (game.isStarted) {
            connection.matchId = createOrUpdateMatch(game, slotLive.versus.id)?.id || null;
            connection.versusId = slotLive.versus.id;
        }

        if (game.isEnded) {
            onMatchEnded(connection);
        }

        updateReplayName(ws, connection, slotLive);
    }

    refreshSlotMatch(slotLive);
}

function onScoreboard(connection: Connection, slotLive: SlotLive, payload: unknown): void {
    const scoreboard = isObject(payload) ? payload as ScoreboardPayload : null;
    setSlotState(slotLive, Topic.SCOREBOARD, scoreboard);

    // The versus of the slot can be changed during the match
    if (scoreboard && connection.matchId && slotLive.game?.isStarted && connection.versusId === slotLive.versus?.id) {
        saveScoreboard(slotLive, connection.matchId, scoreboard);
        refreshSlotMatch(slotLive);
    }
}

function onResult(connection: Connection, slotLive: SlotLive, payload: unknown): void {
    if (!isObject(payload) || !Array.isArray(payload['score'])) return;
    const result = payload as ResultPayload;

    // Sent again on each connection until the end of the next match
    const resultKey = result.guid || `${result.client}|${result.endedAt}`;
    if (lastResults.get(connection.slotId) === resultKey) return;
    lastResults.set(connection.slotId, resultKey);

    publishSlot(connection.slotId, Topic.RESULT, result);

    const versus = slotLive.versus;
    if (!versus) return;

    // Without guid, the result is only saved in the match that just ended: on a connection, it can be the one of a previous match
    if (!result.guid && !(connection.matchId && slotLive.game?.isEnded)) return;

    const matchData = saveMatchResult(result, versus.id, result.guid ? null : connection.matchId);
    if (!matchData) return;

    logger.info(`🏆 Result of match ${matchData.id} saved (${result.score[0]} - ${result.score[1]}).`);

    if (isObject(result.scoreboard)) {
        saveScoreboard(slotLive, matchData.id, result.scoreboard);
    }

    onMatchEnded(connection);
}

function onResponse(payload: unknown): void {
    if (!isObject(payload)) return;
    const response = payload as ResponsePayload;

    if (response.success) {
        logger.debug(`🎮 Command "${response.command}" done${response.result ? `: ${JSON.stringify(response.result)}` : ''}`);
    } else {
        logger.warn(`⚠️ Command "${response.command}" refused by the game: ${response.error}`);
    }
}

export default new Elysia({
    name: "Plugin",
    prefix: "/"
})
    .ws("", {
        beforeHandle({ set, query, headers }): string | void {
            if (!getSlotOfToken({ query, headers })) {
                logger.warn(`⚠️ Token not matching or not found in database`);

                set.status = "Not Found";
                return "NOT_FOUND";
            }
        },

        open(ws): void {
            // The token is checked once: the slot of the connection is kept for its messages
            const slotLive = getSlotOfToken(ws.data);
            if (!slotLive) {
                ws.close();
                return;
            }

            const { id } = ws;
            const slotName = `"${slotLive.slot.name}" (${slotLive.slot.id})`;
            if (!slotLive.pluginConnectionId) {
                logger.info(`🎮 Game "${id}" connected to slot ${slotName}.`);
            } else if (slotLive.pluginConnectionId !== id) {
                logger.warn(`🎮 Game "${slotLive.pluginConnectionId}" replaced by "${id}" on slot ${slotName}.`);
                clearPluginStates(slotLive);
            }

            // The plugin sends its version, then all its states
            slotLive.pluginConnectionId = id;
            const connection: Connection = {
                slotId: slotLive.slot.id,
                tournamentId: slotLive.slot.tournamentId,
                plugin: null,
                warned: false,
                matchId: null,
                versusId: null,
                replayName: null,
                close: () => ws.close()
            };
            connections.set(id, connection);
            registerPlugin(connection.slotId, connection.close);
        },

        message(ws, message: any): void {
            const connection = connections.get(ws.id);
            const slotLive = connection && getSlotOfConnection(ws.id, connection);
            if (!connection || !slotLive) return;

            if (typeof message === "string") {
                try {
                    message = JSON.parse(message);
                } catch {
                    return;
                }
            }
            if (!isObject(message) || typeof message['topic'] !== "string") return;

            const { topic, payload } = message;
            if (topic === Topic.PLUGIN) {
                onPlugin(connection, slotLive, payload);
                return;
            }

            if (connection.plugin?.protocol !== PLUGIN_PROTOCOL) {
                // Plugins older than the protocol 2 don't send the plugin message
                if (!connection.plugin && !connection.warned) {
                    logger.warn(`⚠️ The plugin of the game is too old for RLTM, update RLTM Bridge: https://github.com/Minarox/RLTM-Bridge/releases`);
                }
                connection.warned = true;
                return;
            }

            switch (topic) {
                case Topic.MATCH:
                    onMatch(ws, connection, slotLive, payload);
                    break;

                case Topic.PLAYERS:
                    setSlotState(slotLive, Topic.PLAYERS, Array.isArray(payload) ? payload : null);
                    updateReplayName(ws, connection, slotLive);
                    break;

                case Topic.SCOREBOARD:
                    onScoreboard(connection, slotLive, payload);
                    break;

                case Topic.STATS:
                case Topic.SPECTATOR:
                    setSlotState(slotLive, topic, isObject(payload) ? payload : null);
                    break;

                case Topic.ENTITIES:
                    setEntities(slotLive, isObject(payload) ? payload as any : null);
                    break;

                case Topic.STATISTIC:
                case Topic.EVENT:
                    if (isObject(payload)) publishSlot(connection.slotId, topic, payload);
                    break;

                case Topic.RESULT:
                    onResult(connection, slotLive, payload);
                    break;

                case "response":
                    onResponse(payload);
                    break;
            }
        },

        close({ id }): void {
            const connection = connections.get(id);
            connections.delete(id);
            if (!connection) return;

            unregisterPlugin(connection.slotId, connection.close);
            const slotLive = getSlotOfConnection(id, connection);
            if (!slotLive) return;

            slotLive.pluginConnectionId = null;
            slotLive.game = null;
            clearPluginStates(slotLive);
            refreshSlotMatch(slotLive);
            logger.info(`🎮 Game "${id}" disconnected from slot "${slotLive.slot.name}".`);
        }
    });
