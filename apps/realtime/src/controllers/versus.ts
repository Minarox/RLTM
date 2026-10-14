import { Topic } from "@rltm/shared";
import { Elysia } from "elysia";
import { page } from "../paths.ts";
import { overlaySocket } from "./subscriptions.ts";

export default new Elysia({
    name: "Versus",
    prefix: "/versus"
})
    .get("", () => page('versus'))
    .ws("", overlaySocket({ slot: [Topic.VERSUS] }));
