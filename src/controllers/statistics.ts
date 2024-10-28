import { Elysia } from "elysia";
import { getTournamentById } from "../database/queries/tournament.ts";
import app from "../extensions/app.ts";
import { Topic } from "../types/plugin.ts";

export default new Elysia({
    name: "Statistics"
})
    .get("/statistics/:tournamentId", ({set, params}) => {
        if (!app.store.hasOwnProperty(params["tournamentId"]) || !getTournamentById(params["tournamentId"])) {
            set.status = "Not Found";
            return "Not Found";
        }

        return Bun.file('src/pages/statistics.html');
    })

    .ws("/statistics/:tournamentId", {
        beforeHandle({ set, params }): string | void {
            if (!app.store.hasOwnProperty(params["tournamentId"]) || !getTournamentById(params["tournamentId"])) {
                set.status = "Not Found";
                return "Not Found";
            }
        },

        open({ data, subscribe, send }): void {
            const tournamentId: string = data.params.tournamentId;

            [Topic.TOURNAMENT, Topic.SEASON, Topic.VERSUS, Topic.MATCH, Topic.STATISTICS]
                .forEach((key: string): void => {
                    subscribe(`${tournamentId}_${key}`);

                    switch (key) {
                        case Topic.TOURNAMENT:
                            send(JSON.stringify({ tournament: app.store[tournamentId][Topic.TOURNAMENT] }));
                            break;

                        case Topic.SEASON:
                            send(JSON.stringify({ season: app.store[tournamentId][Topic.SEASON] }));
                            break;

                        case Topic.VERSUS:
                            send(JSON.stringify({ versus: app.store[tournamentId][Topic.VERSUS] }));
                            break;

                        case Topic.MATCH:
                            send(JSON.stringify({ match: app.store[tournamentId][Topic.MATCH] }));
                            break;

                        case Topic.STATISTICS:
                            send(JSON.stringify({ statistics: app.store[tournamentId][Topic.STATISTICS] }));
                            break;
                    }
            })
        },

        close({ data, unsubscribe }): void {
            const tournamentId: string = data.params.tournamentId;

            [Topic.TOURNAMENT, Topic.SEASON, Topic.VERSUS, Topic.MATCH, Topic.STATISTICS]
                .forEach((key: string): void => {
                    unsubscribe(`${tournamentId}_${key}`);
                })
        }
    });
