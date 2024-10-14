import { and, eq, sql } from "drizzle-orm";
import db from "../../extensions/database.ts";
import type { Match } from "../schemas/match.ts";
import { versus, type Versus } from "../schemas/versus.ts";
import { getMatchsByVersus } from "./match.ts";
import { getCurrentSeason } from "./season.ts";
import { getTeamById } from "./team.ts";

export function getCurrentVersus(tournamentId: string) {
    const season = getCurrentSeason(tournamentId);
    const currentDate: string = new Date().toISOString().split('T')[0];

    return db
        .select({
            id: versus.id,
            seasonId: versus.seasonId,
            team1Id: versus.team1Id,
            team2Id: versus.team2Id,
            length: versus.length,
            playedAt: versus.playedAt
        })
        .from(versus)
        .where(
            and(
                eq(versus.seasonId, season?.id),
                eq(sql`DATE(${versus.playedAt})`, currentDate)
            )
        )
        .get() as Versus;
}

export function getCurrentVersusRecursive(tournamentId: string) {
    const currentVersus = getCurrentVersus(tournamentId);

    if (currentVersus) {
        const matchs = getMatchsByVersus(currentVersus.id);
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
            ...currentVersus,
            team1: {
                ...getTeamById(currentVersus.team1Id)
            },
            team2: {
                ...getTeamById(currentVersus.team2Id)
            },
            versusScore: versusScore,
        } as Versus;
    }

    return currentVersus;
}
