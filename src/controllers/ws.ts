import {Elysia} from "elysia";
import setup from "../extensions/setup.ts";
import { GameTopic } from "../types/game.ts";

const app = new Elysia({
    name: "WebSocket",
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

            app.decorator.event.emit("match");
            app.decorator.event.emit("statistics");

            app.decorator.log.info(`Game ${ws.id} disconnected.`);
        }
    });

export default app;
