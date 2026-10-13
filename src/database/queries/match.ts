import { and, desc, eq } from "drizzle-orm";
import db from "../../extensions/database.ts";
import { app } from "../../index.ts";
import type { MatchPayload, ResultPayload } from "../../types/plugin.ts";
import { arena } from "../schemas/arena.ts";
import { type Match, match } from "../schemas/match.ts";

const select = {
    id: match.id,
    versusId: match.versusId,
    guid: match.guid,
    scoreTeam1: match.scoreTeam1,
    scoreTeam2: match.scoreTeam2,
    clock: match.clock,
    duration: match.duration,
    arenaCode: match.arenaCode,
    finished: match.finished,
    overtime: match.overtime
}

export function createOrUpdateMatch(matchData: MatchPayload, versusId: number): Match | undefined {
    // The guid of the game identifies the match, the last match of the versus is used without it (offline matches)
    const matchFound = matchData.guid ? getMatchByGuid(matchData.guid, versusId) : getCurrentMatch(versusId);

    let clock;
    if (matchData.isUnlimited) {
        clock = matchData.clock;
    } else if (matchData.isOvertime) {
        clock = matchData.duration + matchData.clock;
    } else {
        clock = matchData.duration - matchData.clock;
    }

    let query;
    if (matchFound && (matchData.guid || matchData.isEnded || !matchFound.finished)) {
        const data: any = {
            scoreTeam1: matchData.score[0],
            scoreTeam2: matchData.score[1],
            duration: matchData.isUnlimited ? -1 : matchData.duration,
            arenaCode: matchData.arenaCode,
            finished: matchData.isEnded,
            overtime: matchData.isOvertime
        }

        if (!matchData.isEnded) {
            data.clock = clock;
        }

        query = db
            .update(match)
            .set(data)
            .where(eq(match.id, matchFound.id))
            .returning(select)
            .get() as Match;

        app.decorator.log.debug(`Update match ${query.id} for versus ${versusId}`);
    } else {
        query = db
            .insert(match)
            .values({
                versusId: versusId,
                guid: matchData.guid || null,
                scoreTeam1: matchData.score[0],
                scoreTeam2: matchData.score[1],
                clock: clock,
                duration: matchData.isUnlimited ? -1 : matchData.duration,
                arenaCode: matchData.arenaCode,
                finished: matchData.isEnded,
                overtime: matchData.isOvertime
            })
            .returning(select)
            .get() as Match;

        app.decorator.log.debug(`Create new match ${query.id} for versus ${versusId}`);
    }

    return query;
}

export function saveMatchResult(resultData: ResultPayload, versusId: number, matchId?: number | null): Match | undefined {
    let matchFound = resultData.guid ? getMatchByGuid(resultData.guid, versusId) : undefined;
    if (!matchFound && matchId) {
        matchFound = getMatchById(matchId);
    }

    const data = {
        scoreTeam1: resultData.score[0],
        scoreTeam2: resultData.score[1],
        arenaCode: resultData.arenaCode,
        finished: true,
        overtime: resultData.isOvertime
    }

    let query;
    if (matchFound) {
        query = db
            .update(match)
            .set(data)
            .where(eq(match.id, matchFound.id))
            .returning(select)
            .get() as Match;

        app.decorator.log.debug(`Save result of match ${query.id} for versus ${versusId}`);
    } else {
        query = db
            .insert(match)
            .values({
                ...data,
                versusId: versusId,
                guid: resultData.guid || null,
                clock: Math.round(resultData.timePlayed),
                duration: resultData.duration
            })
            .returning(select)
            .get() as Match;

        app.decorator.log.debug(`Create match ${query.id} from result for versus ${versusId}`);
    }

    return query;
}

export function getMatchById(matchId: number): Match | undefined {
    return db
        .select(select)
        .from(match)
        .where(eq(match.id, matchId))
        .get() as Match | undefined;
}

export function getMatchByGuid(guid: string, versusId: number): Match | undefined {
    return db
        .select(select)
        .from(match)
        .where(
            and(
                eq(match.guid, guid),
                eq(match.versusId, versusId)
            )
        )
        .get() as Match | undefined;
}

export function getCurrentMatch(versusId: number): Match {
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

export function getMatchsByVersus(versusId: number): Match[] {
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
