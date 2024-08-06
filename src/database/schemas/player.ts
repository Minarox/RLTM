import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { car } from "./car.ts";
import { tournament } from "./tournament.ts";

export interface Player {
    id: number;
    uid: string;
    plateform: string;
    splitScreenId: string;
    name: string;
    carId: number;
    tournamentId: number;
    createdAt: string;
    updatedAt: string;
}

export const player = sqliteTable("player", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uid: text("uid"),
    plateform: text("plateform"),
    splitScreenId: text("splitScreenId"),
    name: text("name"),
    carId: integer("carId").references(() => car.id),
    tournamentId: integer("tournamentId").references(() => tournament.id),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`)
});
