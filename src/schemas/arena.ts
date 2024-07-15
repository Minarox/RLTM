import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const arena = sqliteTable("arena", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    code: text("code").notNull().unique('code'),
    name: text("name").notNull(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});

export interface Arena {
    id: number;
    code: string;
    name: string;
    createdAt: string;
}
