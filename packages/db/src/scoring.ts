import { getMatchsByVersus } from "./queries/match.ts";
import { getVersusBySeasonId } from "./queries/versus.ts";
import type { Match } from "./schemas/match.ts";

// Score of each versus of the season: number of matches won by each team
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
