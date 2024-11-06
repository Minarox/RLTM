import { Elysia } from "elysia";
import { getArenaByCode } from "../database/queries/arena.ts";
import { createOrUpdateMatch, getCurrentMatch } from "../database/queries/match.ts";
import { createOrUpdatePlayer } from "../database/queries/player.ts";
import { createOrUpdateStatistic, getCurrentStatistics } from "../database/queries/statistic.ts";
import { checkTournament } from "../database/queries/tournament.ts";
import app from "../extensions/app.ts";
import { Topic } from "../types/app.ts";
import {
    type EntititesPayload,
    type MatchPayload,
    type PlayersPayload,
    type StatisticPayload
} from "../types/plugin.ts";
import { getResults } from "./results.ts";

export default new Elysia({
    name: "Plugin",
    prefix: "/"
})
    .ws("", {
        beforeHandle({ set, params, query }): string | void {
            if (!(query?.hasOwnProperty('token') && checkTournament(params['tournamentId'], query['token']))) {
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
                        }

                        if (match?.isEnded) {
                            const results = getResults(app.store[tournamentId][Topic.SEASON].id);
                            if (app.store[tournamentId][Topic.RESULTS] !== results) {
                                app.store[tournamentId][Topic.RESULTS] = results;
                                server?.publish(`${tournamentId}_${Topic.RESULTS}`, JSON.stringify({ [Topic.RESULTS]: app.store[tournamentId][Topic.RESULTS] }));
                            }

                            const currentScore = app.store[tournamentId][Topic.RESULTS]?.find((versus) => versus.id === app.store[tournamentId][Topic.VERSUS].id)?.score
                            if (currentScore && app.store[tournamentId][Topic.VERSUS].score !== currentScore) {
                                app.store[tournamentId][Topic.VERSUS].score = currentScore;
                                server?.publish(`${tournamentId}_${Topic.VERSUS}`, JSON.stringify({ [Topic.VERSUS]: app.store[tournamentId][Topic.VERSUS] }));
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
