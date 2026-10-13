import { type InferSelectModel } from "drizzle-orm";
import { blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const car = sqliteTable("car", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    picture: blob("picture").notNull()
});

export type Car = InferSelectModel<typeof car>;
