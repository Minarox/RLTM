import { tournamentTopics } from "@rltm/shared";
import { Elysia } from "elysia";
import { page } from "../paths.ts";
import { overlaySocket } from "./subscriptions.ts";

export default new Elysia({
    name: "Results",
    prefix: ""
})
    .get("/results", () => page('results'))
    .get("/scoreboard", () => page('scoreboard'))
    .get("/slider", () => page('slider'))
    .ws("/results", overlaySocket({ tournament: tournamentTopics }));
