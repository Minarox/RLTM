import {Elysia} from "elysia";
import app from "../extensions/app.ts";
import {
    type EntititesPayload,
    GameTopic,
    type MatchPayload,
    type StatisticPayload,
    type StatisticsPayload
} from "../types/plugin.ts";

export default new Elysia({
    name: "Plugin",
    prefix: "/:token",
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

        open({ id }): void {
            app.decorator.log.info(`Game ${id} connected.`);
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

            app.store[token].match = null;
            app.decorator.event.emit(`${token}.live.match`);

            app.store[token].statistics = null;
            app.decorator.event.emit(`${token}.live.statistics`);

            app.decorator.log.info(`Game ${id} disconnected.`);
        }
    });
