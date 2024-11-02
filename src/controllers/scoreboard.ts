import { Elysia } from "elysia";
import { getMatchsByVersus } from "../database/queries/match.ts";
import { getTeamsBySeasonId } from "../database/queries/team.ts";
import { getTournamentById } from "../database/queries/tournament.ts";
import { getVersusBySeasonId } from "../database/queries/versus.ts";
import type { Match } from "../database/schemas/match.ts";
import type { Versus } from "../database/schemas/versus.ts";
import app from "../extensions/app.ts";
import { Topic } from "../types/app.ts";

const topics = [Topic.TOURNAMENT, Topic.SEASON, Topic.SCOREBOARD];

export function getCurrentScoreboard(seasonId: number) {
    const teams = getTeamsBySeasonId(seasonId)
        .map((team) => ({
            ...team,
            score: 0
        }));

    getVersusBySeasonId(seasonId)
        .forEach((vs: Versus) => {
            if (vs.teamForfeit) {
                let winner;

                if (vs.teamForfeit === 1) winner = teams.find((team) => team.id === vs.team1Id);
                if (vs.teamForfeit === 2) winner = teams.find((team) => team.id === vs.team2Id);

                if (winner) winner.score += 3;
            } else {
                const matchs = getMatchsByVersus(vs.id);
                if (matchs.length) {
                    let versusScore = [0, 0];

                    matchs.forEach((match: Match) => {
                        if (match.scoreTeam1 > match.scoreTeam2) {
                            versusScore[0] += 1;
                        } else if (match.scoreTeam1 < match.scoreTeam2) {
                            versusScore[1] += 1;
                        }
                    });

                    let winner;
                    let loser;

                    if (versusScore[0] > versusScore[1]) {
                        winner = teams.find((team) => team.id === vs.team1Id);
                        loser = teams.find((team) => team.id === vs.team2Id);
                    } else {
                        winner = teams.find((team) => team.id === vs.team2Id);
                        loser = teams.find((team) => team.id === vs.team1Id);
                    }

                    if (winner && loser) {
                        winner.score += 3;
                        loser.score += 1;
                    }
                }
            }
        })

    return teams.sort((a, b) => b.score - a.score);
}

export default new Elysia({
    name: "Scoreboard",
    prefix: "/scoreboard"
})
    .get("", Bun.file('src/pages/scoreboard.html'))
    .ws("", {
        beforeHandle({ set, params }): string | void {
            if (!app.store.hasOwnProperty(params["tournamentId"]) || !getTournamentById(params["tournamentId"])) {
                set.status = "Not Found";
                return "NOT_FOUND";
            }
        },

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
