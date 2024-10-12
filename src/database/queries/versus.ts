import { and, eq, sql } from "drizzle-orm";
import db from "../../extensions/database.ts";
import { versus, type Versus } from "../schemas/versus.ts";
import { getGamesByVersusId, getLatestGame } from "./game.ts";
import { getTeamById } from "./team.ts";

export function getCurrentVersus(seasonId: number) {
    const currentDate: string = new Date().toISOString().split('T')[0];
    const game = getLatestGame();

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
                eq(versus.seasonId, game?.versusId || seasonId),
                eq(sql`DATE(${versus.playedAt})`, currentDate)
            )
        )
        .get() as Versus;
}

export function getCurrentVersusRecursive(seasonId: number) {
    const currentVersus = getCurrentVersus(seasonId);
    if (currentVersus) {
        const games = getGamesByVersusId(currentVersus.id);

        return {
            ...currentVersus,
            team1: {
                ...getTeamById(currentVersus.team1Id)
            },
            team2: {
                ...getTeamById(currentVersus.team2Id)
            },
            game_index: games.length
        };
    }

    return currentVersus;
}
