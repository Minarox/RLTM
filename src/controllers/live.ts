import {Elysia} from "elysia";
import app from "../extensions/app.ts";
import {
    type EntititesPayload,
    type StatisticPayload,
} from "../types/plugin.ts";
import Stream from "@elysiajs/stream";

export default new Elysia({
    name: "Live",
    prefix: "/api/:token/live"
})
    .use(app)

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
            .get("/info", ({ params, event }) =>
                new Stream((stream): void => {
                    const store = app.store[params.token];
                    stream.send({
                        tournament: store?.tournament || null,
                        season: store?.season || null,
                        game: store?.game || null
                    });

                    event.on(`${params.token}.live.info`, (): void => {
                        stream.send({
                            tournament: store?.tournament || null,
                            season: store?.season || null,
                            game: store?.game || null
                        });
                    });
                })
            )

            .get("/match", ({ params, event }) =>
                new Stream((stream): void => {
                    stream.send(app.store[params.token]?.match || null);

                    event.on(`${params.token}.live.match`, (): void => {
                        stream.send(app.store[params.token]?.match || null);
                    });
                })
            )

            .get("/statistics", ({ params, event }) =>
                new Stream((stream): void => {
                    stream.send(app.store[params.token]?.statistics || null);

                    event.on(`${params.token}.live.statistics`, (): void => {
                        stream.send(app.store[params.token]?.statistics || null);
                    });
                })
            )

            .get("/statistic", ({ params, event }) =>
                new Stream((stream): void => {
                    event.on(`${params.token}.live.statistic`, (statistic: StatisticPayload): void => {
                        stream.send(statistic || null);
                    });
                })
            )

            .get("/entities", ({ params, event }) =>
                new Stream((stream): void => {
                    event.on(`${params.token}.live.entities`, (entities: EntititesPayload): void => {
                        stream.send(entities || null);
                    });
                })
            )
    );
