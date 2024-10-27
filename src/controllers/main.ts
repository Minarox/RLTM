import { Elysia } from "elysia";
import { getArenaById } from "../database/queries/arena.ts";
import { createOrUpdateMatch, getCurrentMatch, getMatchsByVersus } from "../database/queries/match.ts";
import { createOrUpdatePlayer } from "../database/queries/player.ts";
import { createOrUpdateStatistic, getCurrentStatistics } from "../database/queries/statistic.ts";
import { getTournamentById, getTournamentByToken } from "../database/queries/tournament.ts";
import type { Match } from "../database/schemas/match.ts";
import app from "../extensions/app.ts";
import {
    LiveTopic,
    type EntititesPayload,
    type MatchPayload,
    type PlayersPayload,
    type StatisticPayload
} from "../types/plugin.ts";

export default new Elysia({
    name: "Main",
    websocket: {
        perMessageDeflate: true,
        idleTimeout: 2
    }
})
    .ws("/:tournamentId", {
        beforeHandle({ set, params }): string | void {
            if (!app.store.hasOwnProperty(params["tournamentId"]) || !getTournamentById(params["tournamentId"])) {
                set.status = "Not Found";
                return "Not Found";
            }
        },

        open({ data, id, send }): void {
            const tournamentId: string = data.params.tournamentId;

            if (data.query?.hasOwnProperty('token')) {
                const token = data.query['token'] as string;

                if (getTournamentByToken(token)) {
                    app.store[tournamentId].plugin = id;
                    send(JSON.stringify({ valid: true }));

                    // @ts-ignore
                    const server = app.getServer();
                    server?.publish(`${tournamentId}_${LiveTopic.PLUGIN}`, JSON.stringify({ plugin: id }));
                    app.decorator.log.info(`Game "${id}" connected to "${app.store[tournamentId].tournament.name}".`);
                    return;
                }
            }

            app.decorator.log.info(`Client "${id}" connected to "${app.store[tournamentId].tournament.name}".`);
        },

        message({ id, data, send, subscribe }, message: any): void {
            const tournamentId: string = data.params.tournamentId;

            if (id !== app.store[tournamentId].plugin && message) {
                const payload = JSON.parse(message);
                if (Array.isArray(payload)) {
                    payload.forEach((key: string): void => {
                        key = key.toUpperCase();

                        if (LiveTopic.hasOwnProperty(key)) {
                            subscribe(`${tournamentId}_${LiveTopic[key]}`);
                        }

                        switch (LiveTopic[key]) {
                            case LiveTopic.TOURNAMENT:
                                send(JSON.stringify({ tournament: app.store[tournamentId].tournament }));
                                break;

                            case LiveTopic.SEASON:
                                send(JSON.stringify({ season: app.store[tournamentId].season }));
                                break;

                            case LiveTopic.VERSUS:
                                send(JSON.stringify({ versus: app.store[tournamentId].versus }));
                                break;

                            case LiveTopic.MATCH:
                                send(JSON.stringify({ match: app.store[tournamentId].match }));
                                break;

                            case LiveTopic.PLAYERS:
                                send(JSON.stringify({ players: app.store[tournamentId][LiveTopic.PLAYERS] }));
                                break;

                            case LiveTopic.STATISTICS:
                                send(JSON.stringify({ statistics: app.store[tournamentId][LiveTopic.STATISTICS] }));
                                break;

                            case LiveTopic.PLUGIN:
                                send(JSON.stringify({ plugin: app.store[data.params.tournamentId].plugin }));
                                break;
                        }

                    })
                }
                return;
            }

            // @ts-ignore
            const server = app.getServer();

            switch (message?.topic) {
                case LiveTopic.MATCH:
                    const match: MatchPayload = message.payload as MatchPayload;
                    if (match) {
                        if (match?.isStarted) {
                            const matchData = createOrUpdateMatch(match, tournamentId);

                            if (match.statistics) {
                                Object.keys(match.statistics).forEach((statistic) => {
                                    const playerData = createOrUpdatePlayer(match.statistics[statistic]);
                                    if (matchData && playerData) {
                                        createOrUpdateStatistic(match.statistics[statistic], matchData.id, playerData.id);
                                    }
                                });
                                const currentStatistics = getCurrentStatistics(tournamentId) || null;
                                app.store[tournamentId][LiveTopic.STATISTICS] = currentStatistics;
                                server?.publish(`${tournamentId}_${LiveTopic.STATISTICS}`, JSON.stringify({ statistics: currentStatistics }));
                            }

                            if (app.store[tournamentId].versus) {
                                const matchs = getMatchsByVersus(app.store[tournamentId].versus.id)
                                let versusScore = [0, 0];
                                if (matchs) {
                                    matchs.forEach((match: Match) => {
                                        if (match.scoreTeam1 > match.scoreTeam2) {
                                            versusScore[0] += 1;
                                        } else if (match.scoreTeam1 < match.scoreTeam2) {
                                            versusScore[1] += 1;
                                        }
                                    });
                                }
                                app.store[tournamentId].versus.versusScore = versusScore;
                                server?.publish(`${tournamentId}_${LiveTopic.VERSUS}`, JSON.stringify({ versus: app.store[tournamentId].versus }));
                            }
                        }

                        if (match?.arenaCode) {
                            match.map = getArenaById(match.arenaCode) || null;
                        }
                    }

                    const currentMatch = getCurrentMatch(tournamentId) || null;
                    app.store[tournamentId][LiveTopic.MATCH] = currentMatch;
                    server?.publish(`${tournamentId}_${LiveTopic.MATCH}`, JSON.stringify({ match: { ...currentMatch, replay: match?.isReplay || false } }));
                    break;

                case LiveTopic.PLAYERS:
                    const players: PlayersPayload[] = message.payload as PlayersPayload[];
                    if (players && players?.length) {
                        players.forEach((player: PlayersPayload) => {
                            if (player) {
                                createOrUpdatePlayer(player);
                            }
                        })
                    }

                    app.store[tournamentId][LiveTopic.PLAYERS] = players;
                    server?.publish(`${tournamentId}_${LiveTopic.PLAYERS}`, JSON.stringify({ players: players }));
                    break;

                case LiveTopic.STATISTIC:
                    const statistic: StatisticPayload = message.payload as StatisticPayload;
                    server?.publish(`${tournamentId}_${LiveTopic.STATISTIC}`, JSON.stringify({ statistic: statistic }));
                    break;

                case LiveTopic.ENTITIES:
                    const entities: any = message.payload as EntititesPayload;
                    server?.publish(`${tournamentId}_${LiveTopic.ENTITIES}`, JSON.stringify({ entities: entities }));
                    break;
            }
        },

        close({ data, id, unsubscribe }): void {
            const tournamentId: string = data.params.tournamentId;

            if (id === app.store[tournamentId][LiveTopic.PLUGIN]) {
                app.store[tournamentId][LiveTopic.PLUGIN] = null;
                app.store[tournamentId][LiveTopic.MATCH] = getCurrentMatch(tournamentId) || null;
                app.store[tournamentId][LiveTopic.STATISTICS] = getCurrentStatistics(tournamentId) || null;
                app.store[tournamentId][LiveTopic.PLAYERS] = null;

                // @ts-ignore
                const server = app.getServer();
                server?.publish(`${tournamentId}_${LiveTopic.MATCH}`, JSON.stringify({ match: null }));
                server?.publish(`${tournamentId}_${LiveTopic.STATISTICS}`, JSON.stringify({ statistics: null }));
                server?.publish(`${tournamentId}_${LiveTopic.PLUGIN}`, JSON.stringify({ plugin: null }));
                app.decorator.log.info(`Game "${id}" disconnected.`);
            } else {
                Object.values(LiveTopic).forEach((key: string): void => {
                    unsubscribe(key);
                })
                app.decorator.log.info(`Client "${id}" disconnected.`);
            }
        }
    });
