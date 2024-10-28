import { Elysia } from "elysia";
import { getTournamentById } from "../database/queries/tournament.ts";
import app from "../extensions/app.ts";
import { Topic } from "../types/plugin.ts";

export default new Elysia({
    name: "Versus"
})
    .get("/:tournamentId/versus", ({set, params}) => {
        if (!app.store.hasOwnProperty(params["tournamentId"]) || !getTournamentById(params["tournamentId"])) {
            set.status = "Not Found";
            return "NOT_FOUND";
        }

        return Bun.file('src/pages/versus.html');
    })

    .ws("/:tournamentId/versus", {
        beforeHandle({ set, params }): string | void {
            if (!app.store.hasOwnProperty(params["tournamentId"]) || !getTournamentById(params["tournamentId"])) {
                set.status = "Not Found";
                return "NOT_FOUND";
            }
        },

        open({ data, subscribe, send }): void {
            const tournamentId: string = data.params.tournamentId;

            subscribe(`${tournamentId}_${Topic.VERSUS}`);
            send(JSON.stringify({ [Topic.VERSUS]: app.store[tournamentId][Topic.VERSUS] }));
        },

        close({ data, unsubscribe }): void {
            const tournamentId: string = data.params.tournamentId;

            unsubscribe(`${tournamentId}_${Topic.VERSUS}`);
        }
    });
