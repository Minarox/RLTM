import { Elysia } from "elysia";
import { getTournamentById } from "../database/queries/tournament.ts";
import app from "../extensions/app.ts";
import {
    type EntititesPayload,
    GameTopic,
    type MatchPayload,
    type StatisticPayload,
    type StatisticsPayload
} from "../types/plugin.ts";

export default new Elysia({
    name: "Live",
    prefix: "/api/:tournamentId/live",
    websocket: {
        perMessageDeflate: true,
        idleTimeout: 10
    }
})
    .use(app)

    .ws("", {
        beforeHandle({ set, params }): string | void {
            if (!app.store.hasOwnProperty(params["tournamentId"]) || !getTournamentById(params["tournamentId"])) {
                set.status = "Not Found";
                return "Tournament not found.";
            }
        },

        open({ data, id }): void {
            const tournamentId: string = data.params.tournamentId;

            app.decorator.log.info(`Game ${id} connected to ${tournamentId}.`);

            app.store[tournamentId].plugin = true;
            app.decorator.event.emit(`${tournamentId}.live.info`);
        },

        message({ data }, message: any): void {
            const tournamentId: string = data.params.tournamentId;

            switch (message?.topic) {
                case GameTopic.MATCH:
                    const match: MatchPayload = message.payload as MatchPayload;
                    app.store[tournamentId].match = match;
                    app.decorator.event.emit(`${tournamentId}.live.match`);
                    break;

                case GameTopic.STATISTICS:
                    const statistics: StatisticsPayload = message.payload as StatisticsPayload;
                    app.store[tournamentId].statistics = statistics;
                    app.decorator.event.emit(`${tournamentId}.live.statistics`);
                    break;

                case GameTopic.STATISTIC:
                    const statistic: StatisticPayload = message.payload as StatisticPayload;
                    app.decorator.event.emit(`${tournamentId}.live.statistic`, statistic);
                    break;

                case GameTopic.ENTITIES:
                    const entities: any = message.payload as EntititesPayload;
                    app.decorator.event.emit(`${tournamentId}.live.entities`, entities);
                    break;
            }
        },

        close({ data, id }): void {
            const tournamentId: string = data.params.tournamentId;

            app.store[tournamentId].plugin = false;
            app.decorator.event.emit(`${tournamentId}.live.info`);

            app.store[tournamentId].match = null;
            app.decorator.event.emit(`${tournamentId}.live.match`);

            app.store[tournamentId].statistics = null;
            app.decorator.event.emit(`${tournamentId}.live.statistics`);

            app.decorator.log.info(`Game ${id} disconnected.`);
        }
    })

    .guard(
        {
            beforeHandle({ set, params }): string | void {
                if (!app.store.hasOwnProperty(params["tournamentId"]) || !getTournamentById(params["tournamentId"])) {
                    set.status = "Not Found";
                    return "Tournament not found.";
                }
            }
        },
        (group) => group
            .get("/info", function* ({ params, event }) {
                const store = app.store[params.tournamentId];

                yield event.on(`${params.tournamentId}.live.info`, () => {
                    return {
                        tournament: store?.tournament || null,
                        season: store?.season || null,
                        game: store?.game || null,
                        plugin: store?.plugin || null
                    }
                });

                yield {
                    tournament: store?.tournament || null,
                    season: store?.season || null,
                    game: store?.game || null,
                    plugin: store?.plugin || null
                };
            })

            .get("/match", function* ({ params, event }) {
                yield event.on(`${params.tournamentId}.live.match`, () => {
                    return app.store[params.tournamentId]?.match || null;
                });

                yield app.store[params.tournamentId]?.match || null;
            })

            .get("/statistics", function* ({ params, event }) {
                yield event.on(`${params.tournamentId}.live.statistics`, () => {
                    return app.store[params.tournamentId]?.statistics || null;
                });

                yield app.store[params.tournamentId]?.statistics || null;
            })

            .get("/statistic", function* ({ params, event }) {
                yield event.on(`${params.tournamentId}.live.statistic`, () => {
                    return app.store[params.tournamentId]?.statistic || null;
                });

                yield app.store[params.tournamentId]?.statistic || null;
            })

            .get("/entities", function* ({ params, event }) {
                yield event.on(`${params.tournamentId}.live.entities`, () => {
                    return app.store[params.tournamentId]?.entities || null;
                });

                yield app.store[params.tournamentId]?.entities || null;
            })
    );
