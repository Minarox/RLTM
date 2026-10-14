import { sql, type InferSelectModel } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { arena } from "./arena.ts";
import { versus } from "./versus.ts";

export const match = sqliteTable("match", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    versusId: integer("versus_id").notNull().references(() => versus.id),
    // Identifier of the match in Rocket League, null for offline matches (NULL values aren't unique)
    guid: text("guid"),
    scoreTeam1: integer("score_team_1").notNull().default(0),
    scoreTeam2: integer("score_team_2").notNull().default(0),
    clock: integer("clock"),
    duration: integer("duration"),
    arenaCode: text("arena_code").notNull().references(() => arena.code),
    finished: integer("finished", { mode: "boolean" }).notNull().default(false),
    overtime: integer("overtime", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`)
}, (table) => [
    index("match_versus").on(table.versusId),
    uniqueIndex("match_guid").on(table.guid)
]);

export type Match = InferSelectModel<typeof match> & {
    versus?: InferSelectModel<typeof versus>;
    arena?: InferSelectModel<typeof arena>;
};
