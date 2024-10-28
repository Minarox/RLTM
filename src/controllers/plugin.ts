import { Elysia } from "elysia";
import { getArenaById } from "../database/queries/arena.ts";
import { createOrUpdateMatch, getCurrentMatch, getMatchsByVersus } from "../database/queries/match.ts";
import { createOrUpdatePlayer } from "../database/queries/player.ts";
import { createOrUpdateStatistic, getCurrentStatistics } from "../database/queries/statistic.ts";
import { getTournamentById, getTournamentByToken } from "../database/queries/tournament.ts";
import type { Match } from "../database/schemas/match.ts";
import app from "../extensions/app.ts";
import {
    type EntititesPayload,
    type MatchPayload,
    type PlayersPayload,
    type StatisticPayload
} from "../types/plugin.ts";
import { Topic } from "../types/app.ts";

export default new Elysia({
    name: "Main"
})
    .ws("/:tournamentId", {
        beforeHandle({ set, params }): string | void {
            if (!app.store.hasOwnProperty(params["tournamentId"]) || !getTournamentById(params["tournamentId"])) {
                set.status = "Not Found";
                return "NOT_FOUND";
            }
        },

        open({ data, id, send }): void {
            const tournamentId: string = data.params.tournamentId;

            if (data.query?.hasOwnProperty('token')) {
                const token = data.query['token'] as string;

                if (getTournamentByToken(token)) {
                    app.store[tournamentId][Topic.PLUGIN] = id;
                    send(JSON.stringify({ valid: true }));

                    // @ts-ignore
                    const server = app.getServer();
                    server?.publish(`${tournamentId}_${Topic.PLUGIN}`, JSON.stringify({ [Topic.PLUGIN]: id }));
                    app.decorator.log.info(`Game "${id}" connected to "${app.store[tournamentId][Topic.TOURNAMENT].name}".`);
                    return;
                }
            }

            app.decorator.log.info(`Client "${id}" connected to "${app.store[tournamentId][Topic.TOURNAMENT].name}".`);
        },

        message({ data }, message: any): void {
            // @ts-ignore
            const server = app.getServer();
            const tournamentId: string = data.params.tournamentId;

            switch (message?.topic) {
                case Topic.MATCH:
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
                                app.store[tournamentId][Topic.STATISTICS] = currentStatistics;
                                server?.publish(`${tournamentId}_${Topic.STATISTICS}`, JSON.stringify({ [Topic.STATISTICS]: currentStatistics }));
                            }

                            if (app.store[tournamentId].versus) {
                                const matchs = getMatchsByVersus(app.store[tournamentId][Topic.VERSUS].id)
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

                                if (app.store[tournamentId][Topic.VERSUS].versusScore !== versusScore) {
                                    app.store[tournamentId][Topic.VERSUS].versusScore = versusScore;
                                    server?.publish(`${tournamentId}_${Topic.VERSUS}`, JSON.stringify({ versus: app.store[tournamentId][Topic.VERSUS] }));
                                }
                            }
                        }

                        if (match?.arenaCode) {
                            match.map = getArenaById(match.arenaCode) || null;
                        }
                    }

                    const currentMatch = getCurrentMatch(tournamentId) || null;
                    app.store[tournamentId][Topic.MATCH] = currentMatch;
                    server?.publish(`${tournamentId}_${Topic.MATCH}`, JSON.stringify({ [Topic.MATCH]: { ...currentMatch, replay: match?.isReplay || false } }));
                    break;

                case Topic.PLAYERS:
                    const players: PlayersPayload[] = message.payload as PlayersPayload[];
                    if (players && players?.length) {
                        players.forEach((player: PlayersPayload) => {
                            if (player) {
                                createOrUpdatePlayer(player);
                            }
                        })
                    }

                    app.store[tournamentId][Topic.PLAYERS] = players;
                    server?.publish(`${tournamentId}_${Topic.PLAYERS}`, JSON.stringify({ [Topic.PLAYERS]: players }));
                    break;

                case Topic.STATISTIC:
                    const statistic: StatisticPayload = message.payload as StatisticPayload;
                    server?.publish(`${tournamentId}_${Topic.STATISTIC}`, JSON.stringify({ [Topic.STATISTIC]: statistic }));
                    break;

                case Topic.ENTITIES:
                    const entities: any = message.payload as EntititesPayload;
                    server?.publish(`${tournamentId}_${Topic.ENTITIES}`, JSON.stringify({ [Topic.ENTITIES]: entities }));
                    break;
            }
        },

        close({ data, id, unsubscribe }): void {
            const tournamentId: string = data.params.tournamentId;

            if (id === app.store[tournamentId][Topic.PLUGIN]) {
                app.store[tournamentId][Topic.PLUGIN] = null;
                app.store[tournamentId][Topic.MATCH] = getCurrentMatch(tournamentId) || null;
                app.store[tournamentId][Topic.STATISTICS] = getCurrentStatistics(tournamentId) || null;
                app.store[tournamentId][Topic.PLAYERS] = null;

                // @ts-ignore
                const server = app.getServer();
                server?.publish(`${tournamentId}_${Topic.MATCH}`, JSON.stringify({ [Topic.MATCH]: null }));
                server?.publish(`${tournamentId}_${Topic.STATISTICS}`, JSON.stringify({ [Topic.STATISTICS]: null }));
                server?.publish(`${tournamentId}_${Topic.PLUGIN}`, JSON.stringify({ [Topic.PLUGIN]: null }));
                app.decorator.log.info(`Game "${id}" disconnected.`);
            } else {
                Object.values(Topic).forEach((key: string): void => {
                    unsubscribe(`${tournamentId}_${key}`);
                })
                app.decorator.log.info(`Client "${id}" disconnected.`);
            }
        }
    });
