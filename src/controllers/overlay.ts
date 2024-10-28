import { Elysia } from "elysia";
import { getTournamentById } from "../database/queries/tournament.ts";
import app from "../extensions/app.ts";
import { Topic } from "../types/plugin.ts";

const topics = [Topic.TOURNAMENT, Topic.SEASON, Topic.VERSUS, Topic.MATCH, Topic.STATISTICS];

export default new Elysia({
    name: "Overlay"
})
    .get("/overlay/:tournamentId", ({set, params}) => {
        if (!app.store.hasOwnProperty(params["tournamentId"]) || !getTournamentById(params["tournamentId"])) {
            set.status = "Not Found";
            return "NOT_FOUND";
        }

        return Bun.file('src/pages/overlay.html');
    })

    .ws("/overlay/:tournamentId", {
        beforeHandle({ set, params }): string | void {
            if (!app.store.hasOwnProperty(params["tournamentId"]) || !getTournamentById(params["tournamentId"])) {
                set.status = "Not Found";
                return "NOT_FOUND";
            }
        },

        open({ data, subscribe, send }): void {
            const tournamentId: string = data.params.tournamentId;

            topics.forEach((key: string): void => {
                subscribe(`${tournamentId}_${key}`);
                send(JSON.stringify({ [key]: app.store[tournamentId][key] }));
            })
        },

        close({ data, unsubscribe }): void {
            const tournamentId: string = data.params.tournamentId;

            topics.forEach((key: string): void => {
                unsubscribe(`${tournamentId}_${key}`);
            })
        }
    });
