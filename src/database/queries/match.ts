import { and, desc, eq } from "drizzle-orm";
import db from "../../extensions/database.ts";
import type { MatchPayload } from "../../types/plugin.ts";
import { type Match, match } from "../schemas/match.ts";
import { getArenaByCode } from "./arena.ts";
import { getCurrentVersus } from "./versus.ts";

const select = {
    id: match.id,
    versusId: match.versusId,
    scoreTeam1: match.scoreTeam1,
    scoreTeam2: match.scoreTeam2,
    clock: match.clock,
    duration: match.duration,
    arenaCode: match.arenaCode,
    finished: match.finished,
    overtime: match.overtime
}

export function createOrUpdateMatch(matchData: MatchPayload, tournamentId: string) {
    const matchFound = getCurrentMatch(tournamentId);
    const versus = getCurrentVersus(tournamentId);

    if (!versus) {
        return undefined;
    }

    let clock;
    if (matchData.isUnlimited) {
        clock = matchData.clock;
    } else if (matchData.isOvertime) {
        clock = matchData.duration + matchData.clock;
    } else {
        clock = matchData.duration - matchData.clock;
    }

    let query;
    if (matchFound && !matchFound.finished) {
        query = db
            .update(match)
            .set({
                scoreTeam1: matchData.score[0],
                scoreTeam2: matchData.score[1],
                clock: clock,
                duration: matchData.isUnlimited ? -1 : matchData.duration,
                arenaCode: matchData.arenaCode,
                finished: matchData.isEnded,
                overtime: matchData.isOvertime
            })
            .where(eq(match.id, matchFound.id));
    } else {
        query = db
            .insert(match)
            .values({
                versusId: versus.id,
                scoreTeam1: matchData.score[0],
                scoreTeam2: matchData.score[1],
                clock: clock,
                duration: matchData.isUnlimited ? -1 : matchData.duration,
                arenaCode: matchData.arenaCode,
                finished: matchData.isEnded,
                overtime: matchData.isOvertime
            });
    }

    return query
        .returning(select)
        .get() as Match;
}

export function getCurrentMatch(tournamentId: string) {
    const versus = getCurrentVersus(tournamentId);

    if (!versus) {
        return undefined;
    }

    const currentMatch = db
        .select(select)
        .from(match)
        .where(eq(match.versusId, versus.id))
        .orderBy(desc(match.createdAt))
        .get() as Match;

    if (!currentMatch) {
        return undefined;
    }
    return { ...currentMatch, arena: getArenaByCode(currentMatch.arenaCode) };
}

export function getMatchsByVersus(versusId: number) {
    return db
        .select(select)
        .from(match)
        .where(
            and(
                eq(match.versusId, versusId),
                eq(match.finished, true)
            )
        )
        .orderBy(desc(match.createdAt))
        .all() as Match[];
}
