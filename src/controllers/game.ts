import {Elysia} from "elysia";
import setup from "../extensions/setup.ts";
import { GameTopic, type StatisticPayload } from "../types/game.ts";
import Stream from "@elysiajs/stream";

const app = new Elysia({
    name: "Game",
    websocket: {
        perMessageDeflate: true,
        idleTimeout: 10
    }
})
    .use(setup)

    .ws("/", {
        perMessageDeflate: true,
        open(ws: any): void {
            app.decorator.log.info(`Game ${ws.id} connected.`);
        },
        message(_ws: any, message: any): void {
            switch (message?.topic) {
                case GameTopic.MATCH:
                    app.store.match = message.payload;
                    app.decorator.event.emit("match");
                    console.log(message.payload);
                    break;

                case GameTopic.STATISTICS:
                    app.store.statistics = message.payload;
                    app.decorator.event.emit("statistics");
                    // console.log(message.payload);
                    break;

                case GameTopic.STATISTIC:
                    app.decorator.event.emit("statistic", message.payload);
                    // console.log(message.payload);
                    break;

                case GameTopic.ENTITIES:
                    app.decorator.event.emit("entities", message.payload);
                    // console.table(JSON.stringify(message.payload, null, 4));
                    break;
            }
        },
        close(ws: any): void {
            app.store.match = null;
            app.store.statistics = null;

            app.decorator.log.info(`Game ${ws.id} disconnected.`);
        }
    })

    .get("/api/game/match", () =>
        new Stream((stream): void => {
            stream.send(app.store.match || 'null');

            app.decorator.event.on("match", (): void => {
                stream.send(app.store.match || 'null');
            });

        }))

    .get("/api/game/statistics", () =>
        new Stream((stream): void => {
            stream.send(app.store.statistics || 'null');

            app.decorator.event.on("statistics", (): void => {
                stream.send(app.store.statistics || 'null');
            });
        }))

    .get("/api/game/statistic", () =>
        new Stream((stream): void => {
            app.decorator.event.on("statistic", (statistic: StatisticPayload): void => {
                stream.send(statistic);
            });
        }))

    .get("/api/game/entities", () =>
        new Stream((stream): void => {
            app.decorator.event.on("entities", (entities: any): void => {
                stream.send(entities);
            });
        }));

export default app;
