import { Elysia } from "elysia";
import { createOrUpdateMatch, getCurrentMatch, saveMatchResult } from "../database/queries/match.ts";
import { createOrUpdatePlayer } from "../database/queries/player.ts";
import { createOrUpdateStatistic, getCurrentStatistics } from "../database/queries/statistic.ts";
import { getTournamentByToken } from "../database/queries/tournament.ts";
import { app } from "../index.ts";
import { pluginStateTopics, Topic } from "../types/app.ts";
import {
    PLUGIN_PROTOCOL,
    type MatchPayload,
    type PlayersPayload,
    type PluginCommand,
    type PluginInfoPayload,
    type ResponsePayload,
    type ResultPayload,
    type ScoreboardPayload
} from "../types/plugin.ts";
import { findPlayer, getReplayNameCommand, getStatisticValues } from "../utils/plugin.ts";
import { getResults } from "./results.ts";

interface Connection {
    tournamentId: string;
    // plugin message received at the connection, null for a plugin older than the protocol 2
    plugin: PluginInfoPayload | null;
    warned: boolean;
    match: MatchPayload | null;
    // Match of the database the scoreboard is saved in
    matchId: number | null;
    // Last replay name sent to the game
    replayName: string | null;
}

const connections = new Map<string, Connection>();

// Last result received for each tournament: the plugin sends it again on each connection
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

function getTournamentId(data: any): string | undefined {
    const token = getToken(data);
    return token ? getTournamentByToken(token)?.id : undefined;
}

function isObject(value: unknown): value is { [key: string]: any } {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function publish(tournamentId: string, topic: string, payload: unknown): void {
    // @ts-ignore
    app.getServer()?.publish(`${tournamentId}_${topic}`, JSON.stringify({ [topic]: payload }));
}

function setState(tournamentId: string, topic: Topic, payload: unknown): void {
    app.store[tournamentId][topic] = payload;
    publish(tournamentId, topic, payload);
}

function clearPluginStates(tournamentId: string): void {
    pluginStateTopics.forEach((topic) => setState(tournamentId, topic, null));
}

function sendCommand(ws: any, command: PluginCommand): void {
    app.decorator.log.debug(`🎮 Send command "${command.command}" to the game`);
    ws.send(JSON.stringify(command));
}

function updateResults(tournamentId: string): void {
    const store = app.store[tournamentId];
    if (!store[Topic.SEASON]) return;

    const results = getResults(store[Topic.SEASON].id);
    setState(tournamentId, Topic.RESULTS, results);

    const currentScore = results?.find((versus) => versus.id === store[Topic.VERSUS]?.id)?.score;
    if (currentScore && JSON.stringify(store[Topic.VERSUS].score) !== JSON.stringify(currentScore)) {
        store[Topic.VERSUS].score = currentScore;
        publish(tournamentId, Topic.VERSUS, store[Topic.VERSUS]);
    }
}

function publishMatch(connection: Connection): void {
    const store = app.store[connection.tournamentId];
    const currentMatch = store[Topic.VERSUS] ? getCurrentMatch(store[Topic.VERSUS].id) || null : null;

    store[Topic.MATCH] = currentMatch;
    publish(connection.tournamentId, Topic.MATCH, currentMatch && {
        ...currentMatch,
        replay: connection.match?.isReplay || false,
        teams: connection.match?.teams || null
    });
}

function saveScoreboard(tournamentId: string, matchId: number, scoreboard: ScoreboardPayload): void {
    // carId is only in the players topic
    const players: PlayersPayload[] | null = app.store[tournamentId][Topic.PLAYERS];

    Object.values(scoreboard).forEach((playerData) => {
        if (!isObject(playerData) || typeof playerData.uid !== "string" || typeof playerData.name !== "string") return;

        const playerFound = createOrUpdatePlayer({
            uid: playerData.uid,
            name: playerData.name,
            bot: Boolean(playerData.bot),
            teamIndex: playerData.teamIndex,
            carId: findPlayer(players, playerData)?.carId
        });
        if (playerFound) {
            createOrUpdateStatistic(getStatisticValues(playerData), matchId, playerFound.id);
        }
    });

    setState(tournamentId, Topic.STATISTICS, getCurrentStatistics(matchId) || null);
}

// Name the replay of the game with the teams of the versus, sent again when the teams or the game change
function updateReplayName(ws: any, connection: Connection): void {
    const versus = app.store[connection.tournamentId][Topic.VERSUS];
    if (!versus || !connection.match || connection.match.isEnded) return;

    const command = getReplayNameCommand(versus, app.store[connection.tournamentId][Topic.PLAYERS]);
    if (!command) return;

    const replayName = `${connection.match.guid}|${JSON.stringify(command.payload)}`;
    if (replayName === connection.replayName) return;

    connection.replayName = replayName;
    sendCommand(ws, command);
}

function onPlugin(connection: Connection, payload: unknown): void {
    if (!isObject(payload)) return;
    const plugin = payload as PluginInfoPayload;

    connection.plugin = plugin;
    if (plugin.protocol !== PLUGIN_PROTOCOL) {
        app.decorator.log.warn(`⚠️ RLTM Bridge ${plugin.version} uses the protocol ${plugin.protocol}, RLTM supports the protocol ${PLUGIN_PROTOCOL}: update ${plugin.protocol < PLUGIN_PROTOCOL ? 'the plugin' : 'RLTM'}.`);
        return;
    }

    app.decorator.log.info(`🎮 RLTM Bridge ${plugin.version} connected from "${plugin.client}".`);
    setState(connection.tournamentId, Topic.PLUGIN, plugin);
}

function onMatch(ws: any, connection: Connection, match: unknown): void {
    const versus = app.store[connection.tournamentId][Topic.VERSUS];
    connection.match = isObject(match) ? match as MatchPayload : null;

    if (!connection.match) {
        connection.matchId = null;
        connection.replayName = null;
    } else if (versus) {
        if (connection.match.isStarted) {
            connection.matchId = createOrUpdateMatch(connection.match, versus.id)?.id || null;
        }

        if (connection.match.isEnded) {
            updateResults(connection.tournamentId);
        }

        updateReplayName(ws, connection);
    }

    publishMatch(connection);
}

function onScoreboard(connection: Connection, scoreboard: unknown): void {
    setState(connection.tournamentId, Topic.SCOREBOARD, isObject(scoreboard) ? scoreboard : null);

    if (isObject(scoreboard) && connection.matchId && connection.match?.isStarted) {
        saveScoreboard(connection.tournamentId, connection.matchId, scoreboard);
    }
}

function onResult(connection: Connection, result: unknown): void {
    if (!isObject(result) || !Array.isArray(result['score'])) return;
    const resultData = result as ResultPayload;

    // Sent again on each connection until the end of the next match
    const resultKey = resultData.guid || `${resultData.client}|${resultData.endedAt}`;
    if (lastResults.get(connection.tournamentId) === resultKey) return;
    lastResults.set(connection.tournamentId, resultKey);

    publish(connection.tournamentId, Topic.RESULT, resultData);

    const versus = app.store[connection.tournamentId][Topic.VERSUS];
    if (!versus) return;

    // Without guid, the result is only saved in the match that just ended: on a connection, it can be the one of a previous match
    if (!resultData.guid && !(connection.matchId && connection.match?.isEnded)) return;

    const matchData = saveMatchResult(resultData, versus.id, resultData.guid ? null : connection.matchId);
    if (!matchData) return;

    app.decorator.log.info(`🏆 Result of match ${matchData.id} saved (${resultData.score[0]} - ${resultData.score[1]}).`);

    if (isObject(resultData.scoreboard)) {
        saveScoreboard(connection.tournamentId, matchData.id, resultData.scoreboard);
    }

    updateResults(connection.tournamentId);
    publishMatch(connection);
}

function onResponse(response: unknown): void {
    if (!isObject(response)) return;
    const responseData = response as ResponsePayload;

    if (responseData.success) {
        app.decorator.log.debug(`🎮 Command "${responseData.command}" done${responseData.result ? `: ${JSON.stringify(responseData.result)}` : ''}`);
    } else {
        app.decorator.log.warn(`⚠️ Command "${responseData.command}" refused by the game: ${responseData.error}`);
    }
}

export default new Elysia({
    name: "Plugin",
    prefix: "/"
})
    .ws("", {
        beforeHandle({ set, query, headers }): string | void {
            const tournamentId = getTournamentId({ query, headers });
            if (!(tournamentId && app.store[tournamentId])) {
                app.decorator.log.warn(`⚠️ Token not matching or not found in database`);

                set.status = "Not Found";
                return "NOT_FOUND";
            }
        },

        open({ data, id }): void {
            const tournamentId = getTournamentId(data);
            if (!tournamentId || !app.store[tournamentId]) return;

            const store = app.store[tournamentId];
            if (!store.connection) {
                app.decorator.log.info(`🎮 Game "${id}" connected to "${store[Topic.TOURNAMENT].name}".`);
            } else if (store.connection !== id) {
                app.decorator.log.warn(`🎮 Game "${store.connection}" replaced by "${id}" connected to "${store[Topic.TOURNAMENT].name}".`);
                clearPluginStates(tournamentId);
            }

            // The plugin sends its version, then all its states
            store.connection = id;
            connections.set(id, {
                tournamentId,
                plugin: null,
                warned: false,
                match: null,
                matchId: null,
                replayName: null
            });
        },

        message(ws, message: any): void {
            const connection = connections.get(ws.id);
            if (!connection || app.store[connection.tournamentId]?.connection !== ws.id) return;

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
                onPlugin(connection, payload);
                return;
            }

            if (connection.plugin?.protocol !== PLUGIN_PROTOCOL) {
                // Plugins older than the protocol 2 don't send the plugin message
                if (!connection.plugin && !connection.warned) {
                    app.decorator.log.warn(`⚠️ The plugin of the game is too old for RLTM, update RLTM Bridge: https://github.com/Minarox/RLTM-Bridge/releases`);
                }
                connection.warned = true;
                return;
            }

            switch (topic) {
                case Topic.MATCH:
                    onMatch(ws, connection, payload);
                    break;

                case Topic.PLAYERS:
                    setState(connection.tournamentId, Topic.PLAYERS, Array.isArray(payload) ? payload : null);
                    updateReplayName(ws, connection);
                    break;

                case Topic.SCOREBOARD:
                    onScoreboard(connection, payload);
                    break;

                case Topic.STATS:
                case Topic.SPECTATOR:
                case Topic.ENTITIES:
                    setState(connection.tournamentId, topic, isObject(payload) ? payload : null);
                    break;

                case Topic.STATISTIC:
                case Topic.EVENT:
                    if (isObject(payload)) publish(connection.tournamentId, topic, payload);
                    break;

                case Topic.RESULT:
                    onResult(connection, payload);
                    break;

                case "response":
                    onResponse(payload);
                    break;
            }
        },

        close({ id }): void {
            const connection = connections.get(id);
            connections.delete(id);
            if (!connection || app.store[connection.tournamentId]?.connection !== id) return;

            app.store[connection.tournamentId].connection = null;
            clearPluginStates(connection.tournamentId);
            app.decorator.log.info(`🎮 Game "${id}" disconnected.`);
        }
    });
