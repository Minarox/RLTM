import { and, eq, sql } from "drizzle-orm";
import db from "../../extensions/database.ts";
import type { Match } from "../schemas/match.ts";
import { versus, type Versus } from "../schemas/versus.ts";
import { getMatchsByVersus } from "./match.ts";
import { getCurrentSeason } from "./season.ts";
import { getTeamById } from "./team.ts";

const select = {
    id: versus.id,
    seasonId: versus.seasonId,
    team1Id: versus.team1Id,
    team2Id: versus.team2Id,
    length: versus.length,
    teamForfeit: versus.teamForfeit,
    playedAt: versus.playedAt
}

export function getCurrentVersus(tournamentId: string) {
    const season = getCurrentSeason(tournamentId);
    const currentDate: string = new Date().toISOString().split('T')[0];

    const versusData = db
        .select(select)
        .from(versus)
        .where(
            and(
                eq(versus.seasonId, season?.id),
                eq(sql`DATE(${versus.playedAt})`, currentDate)
            )
        )
        .get() as Versus;

    if (!versusData) {
        return undefined;
    }

    const matchs = getMatchsByVersus(versusData.id);
    let versusScore = [0, 0];

    if (matchs) {
        matchs.forEach((match: Match) => {
            if (match.scoreTeam1 > match.scoreTeam2) {
                versusScore[0] += 1;
            } else if (match.scoreTeam1 < match.scoreTeam2) {
                versusScore[1] += 1;
            }
        });
    }

    return {
        ...versusData,
        team1: {
            ...getTeamById(versusData.team1Id)
        },
        team2: {
            ...getTeamById(versusData.team2Id)
        },
        versusScore: versusScore,
    } as Versus;
}

export function getVersusBySeasonId(seasonId: number): Versus[] {
    return db
        .select(select)
        .from(versus)
        .where(eq(versus.seasonId, seasonId))
        .orderBy(versus.playedAt)
        .all() as Versus[];
}
