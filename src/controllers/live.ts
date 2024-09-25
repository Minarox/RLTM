import { Elysia } from "elysia";
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
    prefix: "/api/:token/live",
    websocket: {
        perMessageDeflate: true,
        idleTimeout: 10
    }
})
    .use(app)

    .ws("", {
        beforeHandle({ set, params }): string | void {
            if (!app.store.hasOwnProperty(params["token"])) {
                set.status = "Not Found";
                return "Tournament not found.";
            }
        },

        open({ data, id }): void {
            const token: string = data.params.token;

            app.decorator.log.info(`Game ${id} connected to ${token}.`);

            app.store[token].plugin = true;
            app.decorator.event.emit(`${token}.live.info`);
        },

        message({ data }, message: any): void {
            const token: string = data.params.token;

            switch (message?.topic) {
                case GameTopic.MATCH:
                    const match: MatchPayload = message.payload as MatchPayload;
                    app.store[token].match = match;
                    app.decorator.event.emit(`${token}.live.match`);
                    break;

                case GameTopic.STATISTICS:
                    const statistics: StatisticsPayload = message.payload as StatisticsPayload;
                    app.store[token].statistics = statistics;
                    app.decorator.event.emit(`${token}.live.statistics`);
                    break;

                case GameTopic.STATISTIC:
                    const statistic: StatisticPayload = message.payload as StatisticPayload;
                    app.decorator.event.emit(`${token}.live.statistic`, statistic);
                    break;

                case GameTopic.ENTITIES:
                    const entities: any = message.payload as EntititesPayload;
                    app.decorator.event.emit(`${token}.live.entities`, entities);
                    break;
            }
        },

        close({ data, id }): void {
            const token: string = data.params.token;

            app.store[token].plugin = false;
            app.decorator.event.emit(`${token}.live.info`);

            app.store[token].match = null;
            app.decorator.event.emit(`${token}.live.match`);

            app.store[token].statistics = null;
            app.decorator.event.emit(`${token}.live.statistics`);

            app.decorator.log.info(`Game ${id} disconnected.`);
        }
    })

    .guard(
        {
            beforeHandle({ set, params }): string | void {
                if (!app.store.hasOwnProperty(params["token"])) {
                    set.status = "Not Found";
                    return "Tournament not found.";
                }
            }
        },
        (group) => group
            .get("/info", function* ({ params, event }) {
                const store = app.store[params.token];

                yield event.on(`${params.token}.live.info`, () => {
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
                yield event.on(`${params.token}.live.match`, () => {
                    return app.store[params.token]?.match || null;
                });

                yield app.store[params.token]?.match || null;
            })

            .get("/statistics", function* ({ params, event }) {
                yield event.on(`${params.token}.live.statistics`, () => {
                    return app.store[params.token]?.statistics || null;
                });

                yield app.store[params.token]?.statistics || null;
            })

            .get("/statistic", function* ({ params, event }) {
                yield event.on(`${params.token}.live.statistic`, () => {
                    return app.store[params.token]?.statistic || null;
                });

                yield app.store[params.token]?.statistic || null;
            })

            .get("/entities", function* ({ params, event }) {
                yield event.on(`${params.token}.live.entities`, () => {
                    return app.store[params.token]?.entities || null;
                });

                yield app.store[params.token]?.entities || null;
            })
    );
