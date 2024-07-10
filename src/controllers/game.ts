import { Elysia } from "elysia";
import { app } from "../index.ts";
import {GameTopic, type MatchPayload, type StatisticsPayload, type StatisticPayload } from "../types/game.ts";
import type { Player } from "../databases/players.ts";

export default new Elysia({
    websocket: {
        perMessageDeflate: true,
        idleTimeout: 10
    }
})
    .ws('/game', {
        beforeHandle({set, query}): string | void {
            query = Object.assign({}, query);
            if (!query.hasOwnProperty('token')) {
                throw (set.status = 'Unauthorized')
            }
        },
        open(ws): void {
            app.decorator.logestic.info(`Game ${ws.id} connected with token ${(ws.data.query as any).token}`);
        },
        message(_ws, message: any): void {
            switch (message?.topic) {
                case GameTopic.PLAYERS:
                    getPlayers(message.payload);
                    break;

                case GameTopic.MATCH:
                    getMatch(message.payload);
                    break;

                case GameTopic.STATISTICS:
                    getStatistics(message.payload);
                    break;

                case GameTopic.STATISTIC:
                    getStatistic(message.payload);
                    break;

                case GameTopic.ENTITIES:
                    getEntities(message.payload);
                    break;
            }
        },
        close(ws): void {
            app.decorator.logestic.info(`Game ${ws.id} disconnected`);
        }
    })

function getPlayers(payload: Player): void {
    console.log(payload);
}

function getMatch(payload: MatchPayload): void {
    console.log(payload);
}

function getStatistics(payload: StatisticsPayload): void {
    console.log(payload);
}

function getStatistic(payload: StatisticPayload): void {
    console.log(payload);
}

function getEntities(payload: any): void {
    console.log(payload);
}
