import { Elysia } from "elysia";
import { getMatchsByVersus } from "../database/queries/match.ts";
import { getVersusBySeasonId } from "../database/queries/versus.ts";
import type { Match } from "../database/schemas/match.ts";
import { app } from "../index.ts";
import { Topic } from "../types/app.ts";

const topics = [Topic.TOURNAMENT, Topic.SEASON, Topic.TEAMS, Topic.RESULTS];

export function getResults(seasonId: number) {
    return getVersusBySeasonId(seasonId)
        .map((versus: any) => {
            versus.score = [0, 0];

            if (!versus.teamForfeit) {
                const matchs = getMatchsByVersus(versus.id);
                if (matchs.length) {
                    let score = [0, 0];

                    matchs.forEach((match: Match) => {
                        if (match.scoreTeam1 > match.scoreTeam2) {
                            score[0] += 1;
                        } else if (match.scoreTeam1 < match.scoreTeam2) {
                            score[1] += 1;
                        }
                    });

                    versus.score = score;
                }
            }

            return versus;
        });
}

export default new Elysia({
    name: "Results",
    prefix: ""
})
    .get("/results", Bun.file('src/pages/results.html'))
    .get("/scoreboard", Bun.file('src/pages/scoreboard.html'))
    .get("/slider", Bun.file('src/pages/slider.html'))
    .ws("/results", {
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
