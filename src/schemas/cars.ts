import { sqliteTable, text, integer, SQLiteTable } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const cars: SQLiteTable = sqliteTable("cars", {
    id: integer("id").primaryKey(),
    name: text("name").notNull(),
    picture: text("picture").notNull(),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
