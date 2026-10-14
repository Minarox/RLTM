import { Topic } from "@rltm/shared";
import { Elysia } from "elysia";
import { page } from "../paths.ts";
import { overlaySocket } from "./subscriptions.ts";

export default new Elysia({
    name: "Statistics",
    prefix: "/statistics"
})
    .get("", () => page('statistics'))
    .ws("", overlaySocket({
        tournament: [Topic.TOURNAMENT, Topic.SEASON],
        slot: [Topic.VERSUS, Topic.MATCH, Topic.STATISTICS, Topic.SCOREBOARD, Topic.STATS],
        events: true
    }));
