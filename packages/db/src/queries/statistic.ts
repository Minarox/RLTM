import { and, eq } from "drizzle-orm";
import db from "../client.ts";
import { log } from "../logger.ts";
import { player } from "../schemas/player.ts";
import { statistic, type Statistic } from "../schemas/statistic.ts";

const select = {
    id: statistic.id,
    matchId: statistic.matchId,
    playerId: statistic.playerId,
    teamIndex: statistic.teamIndex,
    mvp: statistic.mvp,
    score: statistic.score,
    goals: statistic.goals,
    shots: statistic.shots,
    assists: statistic.assists,
    saves: statistic.saves,
    ballTouches: statistic.ballTouches,
    carTouches: statistic.carTouches,
    demolish: statistic.demolish,
    demolition: statistic.demolition,
    aerialGoal: statistic.aerialGoal,
    backwardsGoal: statistic.backwardsGoal,
    bicycleGoal: statistic.bicycleGoal,
    longGoal: statistic.longGoal,
    turtleGoal: statistic.turtleGoal,
    poolShot: statistic.poolShot,
    overtimeGoal: statistic.overtimeGoal,
    hatTrick: statistic.hatTrick,
    playmaker: statistic.playmaker,
    epicSave: statistic.epicSave,
    savior: statistic.savior,
    center: statistic.center,
    clear: statistic.clear,
    firstTouch: statistic.firstTouch,
    breakoutDamage: statistic.breakoutDamage,
    breakoutDamageLarge: statistic.breakoutDamageLarge,
    lowFive: statistic.lowFive,
    highFive: statistic.highFive,
    hoopsSwishGoal: statistic.hoopsSwishGoal,
    bicycleHit: statistic.bicycleHit,
    ownGoal: statistic.ownGoal,
    koWinner: statistic.koWinner,
    koKnockout: statistic.koKnockout,
    koDoubleKO: statistic.koDoubleKO,
    koTripleKO: statistic.koTripleKO,
    koDeath: statistic.koDeath,
    koLightHit: statistic.koLightHit,
    koHeavyHit: statistic.koHeavyHit,
    koAerialLightHit: statistic.koAerialLightHit,
    koAerialHeavyHit: statistic.koAerialHeavyHit,
    koHitTaken: statistic.koHitTaken,
    koBlockTaken: statistic.koBlockTaken,
    koGrabbed: statistic.koGrabbed,
    koThrown: statistic.koThrown,
    koLightBlock: statistic.koLightBlock,
    koHeavyBlock: statistic.koHeavyBlock,
    koPlayerGrabbed: statistic.koPlayerGrabbed,
    koPlayerThrown: statistic.koPlayerThrown
}

export type StatisticValues = Omit<typeof statistic.$inferInsert, "id" | "matchId" | "playerId" | "createdAt">;

export function createOrUpdateStatistic(statisticData: StatisticValues, matchId?: number, playerId?: number): Statistic | undefined {
    if (!playerId || !matchId) {
        return undefined;
    }

    const statisticFound = getStatistic(matchId, playerId);
    let query;
    if (statisticFound) {
        query = db
            .update(statistic)
            .set(statisticData)
            .where(
                and(
                    eq(statistic.id, statisticFound.id),
                    eq(statistic.matchId, matchId),
                    eq(statistic.playerId, playerId)
                )
            )
            .returning(select)
            .get() as Statistic;

            log.debug(`Update statistic ${query.id} for player ${playerId} in match ${matchId}`);
    } else {
        query = db
            .insert(statistic)
            .values({
                ...statisticData,
                matchId: matchId,
                playerId: playerId
            })
            .returning(select)
            .get() as Statistic;

            log.debug(`Create new statistic ${query.id} for player ${playerId} in match ${matchId}`);
    }

    return query;
}

export function getStatistic(matchId: number, playerId: number): Statistic {
    return db
        .select(select)
        .from(statistic)
        .where(
            and(
                eq(statistic.matchId, matchId),
                eq(statistic.playerId, playerId)
            )
        )
        .get() as Statistic;
}

export function getCurrentStatistics(matchId: number): Statistic[] {
    return db
        .select({
            ...select,
            player: {
                uid: player.uid,
                name: player.name
            }
        }
        )
        .from(statistic)
        .leftJoin(player, eq(statistic.playerId, player.id))
        .where(eq(statistic.matchId, matchId))
        .all() as Statistic[];
}
