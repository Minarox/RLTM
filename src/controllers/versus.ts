import { Elysia } from "elysia";
import { app } from "../index.ts";
import { Topic } from "../types/app.ts";

export default new Elysia({
    name: "Versus",
    prefix: "/versus"
})
    .get("", Bun.file('src/pages/versus.html'))
    .ws("", {
        open({ data, subscribe, send }): void {
            const tournamentId: string = data.params['tournamentId'];

            subscribe(`${tournamentId}_${Topic.VERSUS}`);
            send(JSON.stringify({ [Topic.VERSUS]: app.store[tournamentId][Topic.VERSUS] }));
        },

        close({ data, unsubscribe }): void {
            const tournamentId: string = data.params['tournamentId'];

            unsubscribe(`${tournamentId}_${Topic.VERSUS}`);
        }
    });
