import { desc, eq, sql } from "drizzle-orm";
import db from "../../extensions/database.ts";
import { type Game, game } from "../schemas/game.ts";

export function getLatestGame() {
    const currentDate: string = new Date().toISOString().split('T')[0];

    return db
        .select()
        .from(game)
        .where(eq(sql`DATE(${game.createdAt})`, currentDate))
        .orderBy(desc(game.createdAt))
        .get() as Game;
}
export function getGamesByVersusId(versusId: number) {
    return db
        .select()
        .from(game)
        .where(eq(game.versusId, versusId))
        .orderBy(desc(game.createdAt))
        .all() as Game[];
}
