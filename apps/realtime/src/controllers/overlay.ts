import { pluginStateTopics, Topic } from "@rltm/shared";
import { Elysia } from "elysia";
import { page } from "../paths.ts";
import { overlaySocket } from "./subscriptions.ts";

export default new Elysia({
    name: "Overlay",
    prefix: "/overlay"
})
    .get("", page('overlay'))
    .ws("", overlaySocket({
        tournament: [Topic.TOURNAMENT, Topic.SEASON],
        slot: [Topic.VERSUS, Topic.MATCH, Topic.STATISTICS, ...pluginStateTopics],
        events: true
    }));
