import { sql, type InferSelectModel } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { season } from "./season.ts";
import { team } from "./team.ts";

export const versus = sqliteTable("versus", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    seasonId: integer("season_id").notNull().references(() => season.id),
    team1Id: integer("team_1_id").notNull().references(() => team.id),
    team2Id: integer("team_2_id").notNull().references(() => team.id),
    length: integer("length").notNull().default(5),
    createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
    playedAt: text("played_at")
});

export type Versus = InferSelectModel<typeof versus> & {
    season?: InferSelectModel<typeof season>;
    team1?: InferSelectModel<typeof team>;
    team2?: InferSelectModel<typeof team>;
    versusScore?: Array<number>;
};
