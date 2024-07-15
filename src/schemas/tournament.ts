import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const tournament = sqliteTable("tournament", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    description: text("description"),
    token: text("token").notNull().unique('token').$default(() => sql`hex(randomblob(16))`),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`)
});

export interface Tournament {
    id: number;
    name: string;
    description: string;
    token: string;
    createdAt: string;
    updatedAt: string;
}
