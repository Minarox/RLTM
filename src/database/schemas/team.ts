import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { season } from "./season.ts";

export interface Team {
    id: number;
    seasonId: number;
    name: string;
    players: string;
    logo: Uint8Array;
    color: string;
    createdAt: string;
    updatedAt: string;
}

export const team = sqliteTable("team", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    seasonId: integer("season_id").references(() => season.id),
    name: text("name").notNull(),
    players: text("players").notNull().default("[]"),
    logo: blob("logo"),
    color: text("color").notNull().default("#000000"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`)
});
