import {Elysia} from "elysia";
import setup from "../extensions/setup.ts";
import { type StatisticPayload } from "../types/game.ts";
import Stream from "@elysiajs/stream";

const app = new Elysia({
    name: "Game",
    prefix: "/api/game"
})
    .use(setup)

    .get("/match", () =>
        new Stream((stream): void => {
            stream.send(app.store.match || 'null');

            app.decorator.event.on("match", (): void => {
                stream.send(app.store.match || 'null');
            });

        }))

    .get("/statistics", () =>
        new Stream((stream): void => {
            stream.send(app.store.statistics || 'null');

            app.decorator.event.on("statistics", (): void => {
                stream.send(app.store.statistics || 'null');
            });
        }))

    .get("/statistic", () =>
        new Stream((stream): void => {
            app.decorator.event.on("statistic", (statistic: StatisticPayload): void => {
                stream.send(statistic);
            });
        }))

    .get("/entities", () =>
        new Stream((stream): void => {
            app.decorator.event.on("entities", (entities: any): void => {
                stream.send(entities);
            });
        }));

export default app;
