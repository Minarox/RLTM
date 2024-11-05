import { Elysia } from "elysia";
import { getArenaByCode } from "../database/queries/arena.ts";
import { createOrUpdateMatch, getCurrentMatch, getMatchsByVersus } from "../database/queries/match.ts";
import { createOrUpdatePlayer } from "../database/queries/player.ts";
import { createOrUpdateStatistic, getCurrentStatistics } from "../database/queries/statistic.ts";
import { getTournamentByToken } from "../database/queries/tournament.ts";
import type { Match } from "../database/schemas/match.ts";
import app from "../extensions/app.ts";
import { Topic } from "../types/app.ts";
import {
    type EntititesPayload,
    type MatchPayload,
    type PlayersPayload,
    type StatisticPayload
} from "../types/plugin.ts";
import { getCurrentScoreboard } from "./scoreboard.ts";

export default new Elysia({
    name: "Plugin",
    prefix: "/"
})
    .ws("", {
        beforeHandle({ set, query }): string | void {
            if (!query?.hasOwnProperty('token') || !getTournamentByToken(query['token'] as string)) {
                app.decorator.log.warn(`⚠️ Token not matching or not found in database`);

                set.status = "Not Found";
                return "NOT_FOUND";
            }
        },

        open({ data, id, send }): void {
            const tournamentId: string = data.params['tournamentId'];

            if (!app.store[tournamentId][Topic.PLUGIN]) {
                app.decorator.log.info(`🎮 Game "${id}" connected to "${app.store[tournamentId][Topic.TOURNAMENT].name}".`);
            } else if (app.store[tournamentId][Topic.PLUGIN] !== id) {
                app.decorator.log.warn(`🎮 Game "${app.store[tournamentId][Topic.PLUGIN]}" replaced by "${id}" connected to "${app.store[tournamentId][Topic.TOURNAMENT].name}".`);
            }

            app.store[tournamentId][Topic.PLUGIN] = id;
            send(JSON.stringify({ valid: true }));

            // @ts-ignore
            const server = app.getServer();
            server?.publish(`${tournamentId}_${Topic.PLUGIN}`, JSON.stringify({ [Topic.PLUGIN]: id }));
        },

        message({ data, id, send }, message: any): void {
            // @ts-ignore
            const server = app.getServer();
            const tournamentId: string = data.params['tournamentId'];

            if (id !== app.store[tournamentId][Topic.PLUGIN]) {
                send(JSON.stringify({ valid: false }));
                return;
            }

            switch (message?.topic) {
                case Topic.MATCH:
                    const match: MatchPayload = message.payload as MatchPayload;
                    if (app.store[tournamentId][Topic.VERSUS] && match) {
                        if (match?.isStarted) {
                            const matchData = createOrUpdateMatch(match, app.store[tournamentId][Topic.VERSUS].id);

                            if (matchData && match.statistics) {
                                Object.keys(match.statistics).forEach((statistic) => {
                                    const playerData = createOrUpdatePlayer(match.statistics[statistic]);
                                    if (playerData) {
                                        createOrUpdateStatistic(match.statistics[statistic], matchData.id, playerData.id);
                                    }
                                });
                                const currentStatistics = getCurrentStatistics(matchData.id) || null;
                                app.store[tournamentId][Topic.STATISTICS] = currentStatistics;
                                server?.publish(`${tournamentId}_${Topic.STATISTICS}`, JSON.stringify({ [Topic.STATISTICS]: currentStatistics }));
                            }

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

                                app.store[tournamentId][Topic.SCOREBOARD] = getCurrentScoreboard(app.store[tournamentId][Topic.SEASON].id);
                                server?.publish(`${tournamentId}_${Topic.SCOREBOARD}`, JSON.stringify({ versus: app.store[tournamentId][Topic.SCOREBOARD] }));
                            }
                        }

                        if (match?.arenaCode) {
                            match.map = getArenaByCode(match.arenaCode) || null;
                        }


                        const currentMatch = getCurrentMatch(app.store[tournamentId][Topic.VERSUS].id) || null;
                        app.store[tournamentId][Topic.MATCH] = currentMatch;
                        server?.publish(`${tournamentId}_${Topic.MATCH}`, JSON.stringify({ [Topic.MATCH]: { ...currentMatch, replay: match?.isReplay || false } }));
                    }
                    break;

                case Topic.PLAYERS:
                    const players: PlayersPayload[] = message.payload as PlayersPayload[];
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

        close({ data, id }): void {
            const tournamentId: string = data.params['tournamentId'];

            if (id !== app.store[tournamentId][Topic.PLUGIN]) return;

            app.store[tournamentId][Topic.PLUGIN] = null;
            app.store[tournamentId][Topic.PLAYERS] = null;

            // @ts-ignore
            const server = app.getServer();
            server?.publish(`${tournamentId}_${Topic.PLAYERS}`, JSON.stringify({ [Topic.PLAYERS]: null }));
            server?.publish(`${tournamentId}_${Topic.PLUGIN}`, JSON.stringify({ [Topic.PLUGIN]: null }));
            app.decorator.log.info(`🎮 Game "${id}" disconnected.`);
        }
    });
