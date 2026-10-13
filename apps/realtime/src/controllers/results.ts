import { Elysia } from "elysia";
import { store } from "../live/store.ts";
import { page } from "../paths.ts";
import { Topic } from "@rltm/shared";

const topics = [Topic.TOURNAMENT, Topic.SEASON, Topic.TEAMS, Topic.RESULTS];

export default new Elysia({
    name: "Results",
    prefix: ""
})
    .get("/results", page('results'))
    .get("/scoreboard", page('scoreboard'))
    .get("/slider", page('slider'))
    .ws("/results", {
        open({ data, subscribe, send }): void {
            const tournamentId: string = data.params['tournamentId'];

            topics.forEach((key: string): void => {
                subscribe(`${tournamentId}_${key}`);
                send(JSON.stringify({ [key]: (store[tournamentId] as any)[key] }));
            })
        },

        close({ data, unsubscribe }): void {
            const tournamentId: string = data.params['tournamentId'];

            topics.forEach((key: string): void => {
                unsubscribe(`${tournamentId}_${key}`);
            })
        }
    });
