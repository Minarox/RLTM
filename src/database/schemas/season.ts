import { sql, type InferSelectModel } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { tournament } from "./tournament.ts";

export const season = sqliteTable("season", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    tournamentId: text("tournament_id").references(() => tournament.id),
    name: text("name").notNull(),
    description: text("description"),
    teamLength: integer("team_length").notNull().default(3),
    defaultGameLength: integer("default_game_length").notNull().default(5),
    startAt: text("start_at").notNull(),
    endAt: text("end_at").notNull(),
    createdAt: text("created_at").$default(() => sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").$default(() => sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`)
});

export type Season = InferSelectModel<typeof season> & {
    tournament: InferSelectModel<typeof tournament>;
};
