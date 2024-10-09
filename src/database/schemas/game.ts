import { type InferSelectModel, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { arena } from "./arena.ts";
import { versus } from "./versus.ts";

export const game = sqliteTable("game", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    versusId: integer("versus_id").references(() => versus.id),
    scoreTeam1: integer("score_team_1").notNull().default(0),
    scoreTeam2: integer("score_team_2").notNull().default(0),
    duration: integer("duration"),
    arenaId: integer("arena_id").notNull().references(() => arena.id),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export type Game = InferSelectModel<typeof game> & {
    versus: InferSelectModel<typeof versus>;
    arena: InferSelectModel<typeof arena>;
};
