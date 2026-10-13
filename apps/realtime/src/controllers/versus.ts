import { Elysia } from "elysia";
import { store } from "../live/store.ts";
import { page } from "../paths.ts";
import { Topic } from "@rltm/shared";

export default new Elysia({
    name: "Versus",
    prefix: "/versus"
})
    .get("", page('versus'))
    .ws("", {
        open({ data, subscribe, send }): void {
            const tournamentId: string = data.params['tournamentId'];

            subscribe(`${tournamentId}_${Topic.VERSUS}`);
            send(JSON.stringify({ [Topic.VERSUS]: (store[tournamentId] as any)[Topic.VERSUS] }));
        },

        close({ data, unsubscribe }): void {
            const tournamentId: string = data.params['tournamentId'];

            unsubscribe(`${tournamentId}_${Topic.VERSUS}`);
        }
    });
