import { Elysia } from "elysia";
import { getTournamentById } from "../database/queries/tournament.ts";
import app from "../extensions/app.ts";
import { Topic } from "../types/plugin.ts";

export default new Elysia({
    name: "Versus"
})
    .get("/versus/:tournamentId", ({set, params}) => {
        if (!app.store.hasOwnProperty(params["tournamentId"]) || !getTournamentById(params["tournamentId"])) {
            set.status = "Not Found";
            return "Not Found";
        }

        return Bun.file('src/pages/versus.html');
    })

    .ws("/versus/:tournamentId", {
        beforeHandle({ set, params }): string | void {
            if (!app.store.hasOwnProperty(params["tournamentId"]) || !getTournamentById(params["tournamentId"])) {
                set.status = "Not Found";
                return "Not Found";
            }
        },

        open({ data, subscribe, send }): void {
            const tournamentId: string = data.params.tournamentId;

            subscribe(`${tournamentId}_${Topic.VERSUS}`);
            send(JSON.stringify({ versus: app.store[tournamentId][Topic.VERSUS] }));
        },

        close({ data, unsubscribe }): void {
            const tournamentId: string = data.params.tournamentId;

            unsubscribe(`${tournamentId}_${Topic.VERSUS}`);
        }
    });
