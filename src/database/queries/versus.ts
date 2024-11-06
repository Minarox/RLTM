import { and, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core/alias";
import db from "../../extensions/database.ts";
import type { Match } from "../schemas/match.ts";
import { team } from "../schemas/team.ts";
import { versus, type Versus } from "../schemas/versus.ts";
import { getCarById } from "./car.ts";
import { getMatchsByVersus } from "./match.ts";
import { getPlayerById } from "./player.ts";

const select = {
    id: versus.id,
    seasonId: versus.seasonId,
    team1Id: versus.team1Id,
    team2Id: versus.team2Id,
    length: versus.length,
    teamForfeit: versus.teamForfeit,
    playedAt: versus.playedAt
}

export function getCurrentVersus(seasonId: number): Versus | undefined {
    const currentDate: string = new Date().toISOString().split('T')[0];
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
        .where(
            and(
                eq(versus.seasonId, seasonId),
                eq(sql`DATE(${versus.playedAt})`, currentDate)
            )
        )
        .get() as Versus;

    if (!versusData) {
        return undefined;
    }

    ["team1", "team2"].forEach(key => {
        for (let i = 0; i < versusData[key]?.players.length; i++) {
            const player = versusData[key].players[i];
            if (typeof player === "number") {
                const playerData = getPlayerById(player);

                if (playerData) {
                    playerData.car = getCarById(playerData.carId);
                }

                versusData[key].players[i] = playerData;
            }
        }
    })

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

export function getVersusBySeasonId(seasonId: number): Versus[] {
    return db
        .select(select)
        .from(versus)
        .where(eq(versus.seasonId, seasonId))
        .orderBy(versus.playedAt)
        .all() as Versus[];
}
