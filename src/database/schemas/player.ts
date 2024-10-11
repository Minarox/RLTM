import { sql, type InferSelectModel } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { car } from "./car.ts";
import { tournament } from "./tournament.ts";

export const player = sqliteTable("player", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uid: text("uid"),
    plateform: text("plateform"),
    splitScreenId: text("splitScreenId"),
    name: text("name"),
    bot: integer("bot", { mode: "boolean" }).notNull().default(false),
    carId: integer("carId").references(() => car.id).default(23),
    tournamentId: integer("tournamentId").references(() => tournament.id),
    createdAt: text("created_at").$default(() => sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").$default(() => sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`)
});

export type Player = InferSelectModel<typeof player> & {
    car: InferSelectModel<typeof car>;
    tournament: InferSelectModel<typeof tournament>;
};
