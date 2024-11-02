import { Elysia } from "elysia";
import app from "../extensions/app.ts";
import { Topic } from "../types/app.ts";

const topics = [Topic.TOURNAMENT, Topic.SEASON, Topic.VERSUS, Topic.MATCH, Topic.STATISTICS];

export default new Elysia({
    name: "Statistics",
    prefix: "/statistics"
})
    .get("", Bun.file('src/pages/statistics.html'))
    .ws("", {
        open({ data, subscribe, send }): void {
            const tournamentId: string = data.params['tournamentId'];

            topics.forEach((key: string): void => {
                subscribe(`${tournamentId}_${key}`);
                send(JSON.stringify({ [key]: app.store[tournamentId][key] }));
            })
        },

        close({ data, unsubscribe }): void {
            const tournamentId: string = data.params['tournamentId'];

            topics.forEach((key: string): void => {
                unsubscribe(`${tournamentId}_${key}`);
            })
        }
    });
