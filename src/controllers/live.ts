import { Elysia } from "elysia";
import { getTournamentById, getTournamentByToken } from "../database/queries/tournament.ts";
import app from "../extensions/app.ts";
import {
    type EntititesPayload,
    GameTopic,
    type MatchPayload,
    type PlayersPayload,
    type StatisticPayload,
    type StatisticsPayload
} from "../types/plugin.ts";

export default new Elysia({
    name: "Live"
})
    .get("/live/:tournamentId", ({set, params}) => {
        if (!app.store.hasOwnProperty(params["tournamentId"]) || !getTournamentById(params["tournamentId"])) {
            set.status = "Not Found";
            return "Not Found";
        }

        return Bun.file('pages/live.html');
    })

    .ws("/:tournamentId", {
        beforeHandle({ set, params }): string | void {
            if (!app.store.hasOwnProperty(params["tournamentId"]) || !getTournamentById(params["tournamentId"])) {
                set.status = "Not Found";
                return "Not Found";
            }
        },

        open({ data, id, send, subscribe }): void {
            const tournamentId: string = data.params.tournamentId;

            if (data.query?.hasOwnProperty('token')) {
                const token = data.query['token'] as string;

                if (getTournamentByToken(token)) {
                    app.store[tournamentId].plugin = id;
                    send(JSON.stringify({ valid: true }));
                    app.decorator.log.info(`Game "${id}" connected to "${app.store[tournamentId].tournament.name}".`);
                    return;
                }
            }

            subscribe('broadcast');
            send(JSON.stringify({ ...app.store[tournamentId], plugin: undefined}));
            app.decorator.log.info(`Client "${id}" connected to "${app.store[tournamentId].tournament.name}".`);
        },

        message({ id, data }, message: any): void {
            if (id !== app.store[data.params.tournamentId].plugin) {
                return;
            }

            // @ts-ignore
            const server = app.getServer();
            const tournamentId: string = data.params.tournamentId;

            switch (message?.topic) {
                case GameTopic.MATCH:
                    const match: MatchPayload = message.payload as MatchPayload;
                    app.store[tournamentId].match = match;
                    server?.publish('broadcast', JSON.stringify({ match: match }));
                    break;

                case GameTopic.STATISTICS:
                    const statistics: StatisticsPayload = message.payload as StatisticsPayload;
                    app.store[tournamentId].statistics = statistics;
                    server?.publish('broadcast', JSON.stringify({ statistics: statistics }));
                    break;

                case GameTopic.STATISTIC:
                    const statistic: StatisticPayload = message.payload as StatisticPayload;
                    server?.publish('broadcast', JSON.stringify({ statistic: statistic }));
                    break;

                case GameTopic.ENTITIES:
                    const entities: any = message.payload as EntititesPayload;
                    server?.publish('broadcast', JSON.stringify({ entities: entities }));
                    break;

                case GameTopic.PLAYERS:
                    const players: any = message.payload as PlayersPayload;
                    console.log(players);
                    break;
            }
        },

        close({ data, id, unsubscribe }): void {
            const tournamentId: string = data.params.tournamentId;

            if (id === app.store[tournamentId].plugin) {
                app.store[tournamentId].plugin = null;
                app.store[tournamentId].match = null;
                app.store[tournamentId].statistics = null;

                // @ts-ignore
                const server = app.getServer();
                server?.publish('broadcast', JSON.stringify({ ...app.store[tournamentId], plugin: undefined }));
                app.decorator.log.info(`Game "${id}" disconnected.`);
            } else {
                unsubscribe('broadcast');
                app.decorator.log.info(`Client "${id}" disconnected.`);
            }
        }
    });
