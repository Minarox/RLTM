import { sqliteTable, text, integer, SQLiteTable } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const players: SQLiteTable = sqliteTable("players", {
    id: integer("id").primaryKey(),
    uid: text("uid"),
    plateform: text("plateform"),
    splitScreenId: text("splitScreenId"),
    name: text("name"),
    created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`)
});
