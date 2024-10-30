import { and, desc, eq } from "drizzle-orm";
import db from "../../extensions/database.ts";
import type { MatchPayload } from "../../types/plugin.ts";
import { arena } from "../schemas/arena.ts";
import { type Match, match } from "../schemas/match.ts";

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

export function createOrUpdateMatch(matchData: MatchPayload, versusId: number) {
    const matchFound = getCurrentMatch(versusId);

    let clock;
    if (matchData.isUnlimited) {
        clock = matchData.clock;
    } else if (matchData.isOvertime) {
        clock = matchData.duration + matchData.clock;
    } else {
        clock = matchData.duration - matchData.clock;
    }

    let query;
    if (matchFound && ((!matchData.isEnded && !matchFound.finished) || (matchData.isEnded && !matchFound.finished) || (matchData.isEnded && matchFound.finished))) {
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
                versusId: versusId,
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

export function getCurrentMatch(versusId: number) {
    return db
        .select({
            ...select,
            arena: arena
        })
        .from(match)
        .leftJoin(arena, eq(match.arenaCode, arena.code))
        .where(eq(match.versusId, versusId))
        .orderBy(desc(match.createdAt))
        .get() as Match;
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
