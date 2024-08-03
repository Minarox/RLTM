import { Elysia } from "elysia";
import {GameTopic, type MatchPayload, type StatisticPayload, type StatisticsPayload} from "../types/game.ts";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import Stream from "@elysiajs/stream";
import type { EventEmitter } from "events";
import logger from "../extensions/logger.ts";

export const game = (app: Elysia<"", false, {decorator: { log: typeof logger, db: BunSQLiteDatabase, event: EventEmitter }, store: { match: MatchPayload | null; statistics: StatisticsPayload | null }, derive: {}, resolve: {}}>) => app
    .state("match", null)
    .state("statistics", null)

    .ws("/game", {
        perMessageDeflate: true,
        open(ws): void {
            app.decorator.log.info(`Game ${ws.id} connected.`);
        },
        message(_ws, message: any): void {
            // console.log(message?.topic)
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
        close(ws): void {
            app.store.match = null;
            app.store.statistics = null;

            app.decorator.log.info(`Game ${ws.id} disconnected.`);
        }
    })

    .get("/game/match", () =>
        new Stream((stream): void => {
            stream.send(app.store.match || 'null');

            app.decorator.event.on("match", (): void => {
                stream.send(app.store.match || 'null');
            });

        }))

    .get("/game/statistics", () =>
        new Stream((stream): void => {
            stream.send(app.store.statistics || 'null');

            app.decorator.event.on("statistics", (): void => {
                stream.send(app.store.statistics || 'null');
            });
        }))

    .get("/game/statistic", () =>
        new Stream((stream): void => {
            app.decorator.event.on("statistic", (statistic: StatisticPayload): void => {
                stream.send(statistic);
            });
        }))

    .get("/game/entities", () =>
        new Stream((stream): void => {
            app.decorator.event.on("entities", (entities: any): void => {
                stream.send(entities);
            });
        }));
