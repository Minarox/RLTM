import { Elysia } from "elysia";
import { store } from "../live/store.ts";
import { page } from "../paths.ts";
import { pluginEventTopics, Topic } from "@rltm/shared";

const topics = [Topic.TOURNAMENT, Topic.SEASON, Topic.VERSUS, Topic.MATCH, Topic.STATISTICS, Topic.SCOREBOARD, Topic.STATS];

export default new Elysia({
    name: "Statistics",
    prefix: "/statistics"
})
    .get("", page('statistics'))
    .ws("", {
        open({ data, subscribe, send }): void {
            const tournamentId: string = data.params['tournamentId'];

            topics.forEach((key: string): void => {
                subscribe(`${tournamentId}_${key}`);
                send(JSON.stringify({ [key]: (store[tournamentId] as any)[key] }));
            })

            pluginEventTopics.forEach((key: string): void => {
                subscribe(`${tournamentId}_${key}`);
            })
        },

        close({ data, unsubscribe }): void {
            const tournamentId: string = data.params['tournamentId'];

            [...topics, ...pluginEventTopics].forEach((key: string): void => {
                unsubscribe(`${tournamentId}_${key}`);
            })
        }
    });
