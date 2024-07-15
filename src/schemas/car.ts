import { sqliteTable, text, integer, SQLiteTable } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const car: SQLiteTable = sqliteTable("car", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    picture: text("picture").notNull(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
