import { and, eq, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core/alias";
import db from "../client.ts";
import type { Match } from "../schemas/match.ts";
import { season } from "../schemas/season.ts";
import { team } from "../schemas/team.ts";
import { versus, type Versus } from "../schemas/versus.ts";
import { getMatchsByVersus } from "./match.ts";
import { resolveTeamPlayers } from "./player.ts";

const select = {
    id: versus.id,
    seasonId: versus.seasonId,
    team1Id: versus.team1Id,
    team2Id: versus.team2Id,
    length: versus.length,
    teamForfeit: versus.teamForfeit,
    playedAt: versus.playedAt
}

function selectVersusWithTeams(condition: SQL | undefined): Versus | undefined {
    let team1 = alias(team, 't1');
    let team2 = alias(team, 't2');

    const versusData = db
        .select({
            ...select,
            team1: team1,
            team2: team2
        })
        .from(versus)
        .leftJoin(team1, eq(versus.team1Id, team1.id))
        .leftJoin(team2, eq(versus.team2Id, team2.id))
        .where(condition)
        .get() as Versus;

    if (!versusData) {
        return undefined;
    }

    resolveTeamPlayers([versusData.team1, versusData.team2]);

    const matchs = getMatchsByVersus(versusData.id);
    let score = [0, 0];

    if (matchs) {
        matchs.forEach((match: Match) => {
            if (match.scoreTeam1 > match.scoreTeam2) {
                score[0] += 1;
            } else if (match.scoreTeam1 < match.scoreTeam2) {
                score[1] += 1;
            }
        });
    }

    return {
        ...versusData,
        score: score,
    } as Versus;
}

// Versus of the season played today
export function getCurrentVersus(seasonId: number): Versus | undefined {
    const currentDate: string = new Date().toISOString().split('T')[0];

    return selectVersusWithTeams(
        and(
            eq(versus.seasonId, seasonId),
            eq(sql`DATE(${versus.playedAt})`, currentDate)
        )
    );
}

// Versus with its teams, their players and the score of the versus
export function getVersusById(versusId: number): Versus | undefined {
    return selectVersusWithTeams(eq(versus.id, versusId));
}

export function isVersusOfTournament(versusId: number, tournamentId: string): boolean {
    return Boolean(
        db
            .select({ id: versus.id })
            .from(versus)
            .innerJoin(season, eq(versus.seasonId, season.id))
            .where(and(eq(versus.id, versusId), eq(season.tournamentId, tournamentId)))
            .get()
    );
}

export function getVersusBySeasonId(seasonId: number): Versus[] {
    return db
        .select(select)
        .from(versus)
        .where(eq(versus.seasonId, seasonId))
        .orderBy(versus.playedAt)
        .all() as Versus[];
}
