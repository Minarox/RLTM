import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { planning } from "./planning.ts";
import { arena } from "./arena.ts";

export const game = sqliteTable("game", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uid: text("uid").unique('uid').notNull(),
    planningId: integer("planning_id").references(() => planning.id),
    scoreTeam1: integer("score_team_1").notNull().default(0),
    scoreTeam2: integer("score_team_2").notNull().default(0),
    duration: integer("duration"),
    arenaId: integer("arena_id").notNull().references(() => arena.id),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export interface Game {
    id: number;
    uid: string;
    planningId: number;
    scoreTeam1: number;
    scoreTeam2: number;
    duration: number;
    arenaId: number;
    createdAt: string;
}
