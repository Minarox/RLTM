import { type InferSelectModel, sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const tournament = sqliteTable("tournament", {
    id: text("id").primaryKey().unique('id').$default(() => sql`hex(randomblob(8))`),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`)
});

export type Tournament = InferSelectModel<typeof tournament>;
