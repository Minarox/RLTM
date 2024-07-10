import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const players = sqliteTable("players", {
    id: integer("id").primaryKey(),
    uid: text("uid"),
    plateform: text("plateform"),
    splitScreenId: text("splitScreenId"),
    name: text("name"),
    created_at: text("created_at").default("CURRENT_TIMESTAMP"),
    updated_at: text("updated_at").default("CURRENT_TIMESTAMP")
});
