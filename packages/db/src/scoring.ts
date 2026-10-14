import { and, eq, sql } from "drizzle-orm";
import db from "./client.ts";
import { getVersusBySeasonId } from "./queries/versus.ts";
import { match } from "./schemas/match.ts";
import { versus } from "./schemas/versus.ts";

// Score of each versus of the season: number of matches won by each team, counted in one query
export function getResults(seasonId: number) {
    const wins = new Map(
        db
            .select({
                versusId: match.versusId,
                team1: sql<number>`sum(${match.scoreTeam1} > ${match.scoreTeam2})`,
                team2: sql<number>`sum(${match.scoreTeam1} < ${match.scoreTeam2})`
            })
            .from(match)
            .innerJoin(versus, eq(match.versusId, versus.id))
            .where(and(eq(versus.seasonId, seasonId), eq(match.finished, true)))
            .groupBy(match.versusId)
            .all()
            .map((row) => [row.versusId, [Number(row.team1), Number(row.team2)]])
    );

    return getVersusBySeasonId(seasonId)
        .map((versusData: any) => ({
            ...versusData,
            score: versusData.teamForfeit ? [0, 0] : wins.get(versusData.id) ?? [0, 0]
        }));
}
