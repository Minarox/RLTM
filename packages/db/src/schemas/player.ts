import { sql, type InferSelectModel } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { car } from "./car.ts";

export const player = sqliteTable("player", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uid: text("uid").notNull(),
    name: text("name").notNull(),
    bot: integer("bot", { mode: "boolean" }).notNull().default(false),
    carId: integer("carId").notNull().notNull().references(() => car.id).default(23),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`).$onUpdate(() => sql`(CURRENT_TIMESTAMP)`)
}, (table) => [
    index("player_uid").on(table.uid)
]);

export type Player = InferSelectModel<typeof player> & {
    car?: InferSelectModel<typeof car>;
};
