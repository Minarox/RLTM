import { and, desc, eq } from "drizzle-orm";
import db from "../client.ts";
import { log } from "../logger.ts";
import type { PlayerReference, ResultPayload } from "@rltm/shared";
import { createOrUpdatePlayer } from "./player.ts";
import { createOrUpdateStatistic, type StatisticValues } from "./statistic.ts";
import { arena } from "../schemas/arena.ts";
import { type Match, match } from "../schemas/match.ts";
import { season } from "../schemas/season.ts";
import { versus } from "../schemas/versus.ts";

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

export interface MatchStatistic {
    player: PlayerReference & { carId?: number | undefined };
    values: StatisticValues;
}

// Saves the result of a match and the statistics of its players, at the end of the match, in one transaction.
// The guid of the game identifies the match: a result received again updates it.
export function saveMatchResult(resultData: ResultPayload, versusId: number, statistics: MatchStatistic[]): Match {
    return db.transaction(() => {
        const matchFound = resultData.guid ? getMatchByGuid(resultData.guid) : undefined;

        // The versus of the slot when the match ends: it can be changed during the match
        const data = {
            versusId: versusId,
            scoreTeam1: resultData.score[0],
            scoreTeam2: resultData.score[1],
            arenaCode: resultData.arenaCode,
            finished: true,
            overtime: resultData.isOvertime
        };

        let query: Match;
        if (matchFound) {
            query = db
                .update(match)
                .set(data)
                .where(eq(match.id, matchFound.id))
                .returning(select)
                .get() as Match;

            log.debug(`Save result of match ${query.id} for versus ${versusId}`);
        } else {
            query = db
                .insert(match)
                .values({
                    ...data,
                    guid: resultData.guid || null,
                    clock: Math.round(resultData.timePlayed),
                    duration: resultData.duration
                })
                .returning(select)
                .get() as Match;

            log.debug(`Create match ${query.id} from result for versus ${versusId}`);
        }

        statistics.forEach(({ player, values }) => {
            const playerFound = createOrUpdatePlayer(player);
            createOrUpdateStatistic(values, query.id, playerFound.id);
        });

        return query;
    });
}

// A match of the game is saved once, whatever its versus
export function getMatchByGuid(guid: string): Match | undefined {
    return db
        .select(select)
        .from(match)
        .where(eq(match.guid, guid))
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
        .orderBy(desc(match.id))
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
        .orderBy(desc(match.id))
        .all() as Match[];
}

// Tournament of a match of the game, undefined if the match isn't saved
export function getTournamentIdOfMatch(guid: string): string | undefined {
    return db
        .select({ tournamentId: season.tournamentId })
        .from(match)
        .innerJoin(versus, eq(match.versusId, versus.id))
        .innerJoin(season, eq(versus.seasonId, season.id))
        .where(eq(match.guid, guid))
        .get()?.tournamentId;
}
