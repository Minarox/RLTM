import { Elysia } from "elysia";
import {GameTopic, type MatchPayload, type StatisticsPayload} from "../types/game.ts";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
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
                    console.log(message.payload);
                    break;

                case GameTopic.STATISTICS:
                    app.store.statistics = message.payload;
                    console.log(message.payload);
                    break;

                case GameTopic.STATISTIC:
                    console.log(message.payload);
                    break;
            }
        },
        close(ws): void {
            app.store.match = null;
            app.store.statistics = null;

            app.decorator.log.info(`Game ${ws.id} disconnected.`);
        }
    });
