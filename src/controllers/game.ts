import { Elysia } from "elysia";
import {GameTopic, type MatchPayload, type StatisticsPayload} from "../types/game.ts";
import type { Logestic } from "logestic";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";

export const game = (app: Elysia<"", false, {decorator: { logestic: Logestic, db: BunSQLiteDatabase }, store: { match: MatchPayload | null; statistics: StatisticsPayload | null }, derive: {}, resolve: {}}>) => app
    .state("match", null)
    .state("statistics", null)

    .ws("/game", {
        open(ws): void {
            app.decorator.logestic.info(`Game ${ws.id} connected.`);
        },
        message(_ws, message: any): void {
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

            app.decorator.logestic.info(`Game ${ws.id} disconnected.`);
        }
    });
