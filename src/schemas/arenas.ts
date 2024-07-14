import { sqliteTable, text, integer, SQLiteTable } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const arenas: SQLiteTable = sqliteTable("arenas", {
    id: integer("id").primaryKey(),
    code: text("code").notNull().unique('code'),
    name: text("name").notNull(),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
