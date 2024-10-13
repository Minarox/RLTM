import { Elysia } from "elysia";
import { getTournamentById } from "../database/queries/tournament.ts";
import app from "../extensions/app.ts";

export default new Elysia({
    name: "Versus"
})
    .get("/versus/:tournamentId", ({set, params}) => {
        if (!app.store.hasOwnProperty(params["tournamentId"]) || !getTournamentById(params["tournamentId"])) {
            set.status = "Not Found";
            return "Not Found";
        }

        return Bun.file('src/pages/versus.html');
    });
