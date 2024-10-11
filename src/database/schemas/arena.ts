import { type InferSelectModel } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const arena = sqliteTable("arena", {
    code: text("code").primaryKey(),
    name: text("name").notNull()
});

export type Arena = InferSelectModel<typeof arena>;
