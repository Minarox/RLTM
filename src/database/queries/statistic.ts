import { and, eq } from "drizzle-orm";
import db from "../../extensions/database.ts";
import type { StatisticsPayload } from "../../types/plugin.ts";
import { player } from "../schemas/player.ts";
import { statistic, type Statistic } from "../schemas/statistic.ts";
import { getCurrentMatch } from "./match.ts";
import { getCurrentVersus } from "./versus.ts";

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

export function createOrUpdateStatistic(statisticData: StatisticsPayload, matchId?: number, playerId?: number) {
    if (!playerId || !matchId) {
        return undefined;
    }

    const statisticFound = getStatistic(matchId, playerId);
    let query;
    if (statisticFound) {
        query = db
            .update(statistic)
            .set({
                teamIndex: statisticData.teamIndex,
                mvp: statisticData.mvp,
                score: statisticData.score,
                goals: statisticData.goals,
                shots: statisticData.shots,
                assists: statisticData.assists,
                saves: statisticData.saves,
                ballTouches: statisticData.ballTouches,
                carTouches: statisticData.carTouches,
                demolish: statisticData.Demolish,
                demolition: statisticData.Demolition,
                aerialGoal: statisticData.AerialGoal,
                backwardsGoal: statisticData.BackwardsGoal,
                bicycleGoal: statisticData.BicycleGoal,
                longGoal: statisticData.LongGoal,
                turtleGoal: statisticData.TurtleGoal,
                poolShot: statisticData.PoolShot,
                overtimeGoal: statisticData.OvertimeGoal,
                hatTrick: statisticData.HatTrick,
                playmaker: statisticData.Playmaker,
                epicSave: statisticData.EpicSave,
                savior: statisticData.Savior,
                center: statisticData.Center,
                clear: statisticData.Clear,
                firstTouch: statisticData.FirstTouch,
                breakoutDamage: statisticData.BreakoutDamage,
                breakoutDamageLarge: statisticData.BreakoutDamageLarge,
                lowFive: statisticData.LowFive,
                highFive: statisticData.HighFive,
                hoopsSwishGoal: statisticData.HoopsSwishGoal,
                bicycleHit: statisticData.BicycleHit,
                ownGoal: statisticData.OwnGoal,
                koWinner: statisticData.KO_Winner,
                koKnockout: statisticData.KO_Knockout,
                koDoubleKO: statisticData.KO_DoubleKO,
                koTripleKO: statisticData.KO_TripleKO,
                koDeath: statisticData.KO_Death,
                koLightHit: statisticData.KO_LightHit,
                koHeavyHit: statisticData.KO_HeavyHit,
                koAerialLightHit: statisticData.KO_AerialLightHit,
                koAerialHeavyHit: statisticData.KO_AerialHeavyHit,
                koHitTaken: statisticData.KO_HitTaken,
                koBlockTaken: statisticData.KO_BlockTaken,
                koGrabbed: statisticData.KO_Grabbed,
                koThrown: statisticData.KO_Thrown,
                koLightBlock: statisticData.KO_LightBlock,
                koHeavyBlock: statisticData.KO_HeavyBlock,
                koPlayerGrabbed: statisticData.KO_PlayerGrabbed,
                koPlayerThrown: statisticData.KO_PlayerThrown
            })
            .where(
                and(
                    eq(statistic.id, statisticFound.id),
                    eq(statistic.matchId, matchId),
                    eq(statistic.playerId, playerId)
                )
            );
    } else {
        query = db
            .insert(statistic)
            .values({
                matchId: matchId,
                playerId: playerId,
                teamIndex: statisticData.teamIndex,
                mvp: statisticData.mvp,
                score: statisticData.score,
                goals: statisticData.goals,
                shots: statisticData.shots,
                assists: statisticData.assists,
                saves: statisticData.saves,
                ballTouches: statisticData.ballTouches,
                carTouches: statisticData.carTouches,
                demolish: statisticData.Demolish,
                demolition: statisticData.Demolition,
                aerialGoal: statisticData.AerialGoal,
                backwardsGoal: statisticData.BackwardsGoal,
                bicycleGoal: statisticData.BicycleGoal,
                longGoal: statisticData.LongGoal,
                turtleGoal: statisticData.TurtleGoal,
                poolShot: statisticData.PoolShot,
                overtimeGoal: statisticData.OvertimeGoal,
                hatTrick: statisticData.HatTrick,
                playmaker: statisticData.Playmaker,
                epicSave: statisticData.EpicSave,
                savior: statisticData.Savior,
                center: statisticData.Center,
                clear: statisticData.Clear,
                firstTouch: statisticData.FirstTouch,
                breakoutDamage: statisticData.BreakoutDamage,
                breakoutDamageLarge: statisticData.BreakoutDamageLarge,
                lowFive: statisticData.LowFive,
                highFive: statisticData.HighFive,
                hoopsSwishGoal: statisticData.HoopsSwishGoal,
                bicycleHit: statisticData.BicycleHit,
                ownGoal: statisticData.OwnGoal,
                koWinner: statisticData.KO_Winner,
                koKnockout: statisticData.KO_Knockout,
                koDoubleKO: statisticData.KO_DoubleKO,
                koTripleKO: statisticData.KO_TripleKO,
                koDeath: statisticData.KO_Death,
                koLightHit: statisticData.KO_LightHit,
                koHeavyHit: statisticData.KO_HeavyHit,
                koAerialLightHit: statisticData.KO_AerialLightHit,
                koAerialHeavyHit: statisticData.KO_AerialHeavyHit,
                koHitTaken: statisticData.KO_HitTaken,
                koBlockTaken: statisticData.KO_BlockTaken,
                koGrabbed: statisticData.KO_Grabbed,
                koThrown: statisticData.KO_Thrown,
                koLightBlock: statisticData.KO_LightBlock,
                koHeavyBlock: statisticData.KO_HeavyBlock,
                koPlayerGrabbed: statisticData.KO_PlayerGrabbed,
                koPlayerThrown: statisticData.KO_PlayerThrown
            });
    }

    return query
        .returning(select)
        .get() as Statistic;
}

export function getStatistic(matchId: number, playerId: number) {
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

export function getCurrentStatistics(tournamentId: string) {
    const match = getCurrentMatch(tournamentId);
    const versus = getCurrentVersus(tournamentId);

    if (!match) {
        return undefined;
    }

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
        .where(eq(statistic.matchId, match.id))
        .all() as Statistic[];
}
