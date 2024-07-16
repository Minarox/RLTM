import { Elysia } from "elysia";
import { GameTopic, type MatchPayload } from "../types/game.ts";
import type { Logestic } from "logestic";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { type Tournament, tournament } from "../schemas/tournament.ts";
import { eq } from "drizzle-orm";
import { Stream } from "@elysiajs/stream";

export const game = (app: Elysia<"", false, {decorator: { logestic: Logestic, db: BunSQLiteDatabase }, store: {}, derive: {}, resolve: {}}>) => app
    // Web overlay
    .get("/game", () => {
        new Stream((stream) => {
            const interval = setInterval(() => {
                stream.send('hello world')
            }, 500)

            setTimeout(() => {
                clearInterval(interval)
                stream.close()
            }, 3000)
        })
    })

    // Rocket League
    .ws("/game", {
        beforeHandle({ set, query, logestic, db }): string | void {
            query = Object.assign({}, query);

            logestic.debug("Checking token...");
            if (!query.hasOwnProperty('token')) {
                logestic.warn("Token is missing");
                return (set.status = "Unauthorized");
            }

            const token: string = query["token"] as string;
            const tournamentDatas: Tournament = db.select().from(tournament).where(eq(tournament.token, token)).get() as Tournament;

            logestic.debug(`Token "${token}" found in database: ${tournamentDatas ? "yes" : "no"}`);
            if (!tournamentDatas) {
                logestic.warn("Token is invalid");
                return (set.status = "Unauthorized");
            }

            app.state(token, {
                tournament: tournamentDatas,
                match: null,
                statistics: null
            });
        },
        open(ws): void {
            const token: string = ws.data.query["token"] as string; // @ts-ignore
            const tournament: Tournament = app.store[token].tournament as Tournament;

            app.decorator.logestic.info(`Tournament "${tournament.name}" - Game ${ws.id} connected.`);
        },
        message(ws, message: any): void {
            const token: string = ws.data.query["token"] as string; // @ts-ignore
            let store = app.store[token];

            switch (message?.topic) {
                case GameTopic.MATCH:
                    store = Object.assign({}, store, { match: message.payload });
                    app.state(token, store);
                    computeMatch(message.payload);
                    break;

                case GameTopic.STATISTICS:
                    store = Object.assign({}, store, { statistics: message.payload });
                    app.state(token, store);
                    computeStatistics(message.payload);
                    break;

                /* case GameTopic.STATISTIC:
                    getStatistic(message.payload);
                    break;

                case GameTopic.ENTITIES:
                    getEntities(message.payload);
                    break; */
            }
        },
        close(ws): void {
            const token: string = ws.data.query["token"] as string; // @ts-ignore
            const tournament: Tournament = app.store[token].tournament as Tournament;

            app.decorator.logestic.info(`Tournament "${tournament.name}" - Game ${ws.id} disconnected.`);
            app.state(token, null);
        }
    })

function computeMatch(payload: MatchPayload): void {
    console.log(payload);
}

function computeStatistics(payload: MatchPayload): void {
    console.log(payload);
}
