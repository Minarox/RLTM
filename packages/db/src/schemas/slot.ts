import { type InferSelectModel, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { tournament } from "./tournament.ts";
import { versus } from "./versus.ts";

// Broadcast slot of a tournament: a game PC with its plugin and its overlays, showing one versus
export const slot = sqliteTable("slot", {
    id: text("id").primaryKey().default(sql`(hex(randomblob(8)))`),
    tournamentId: text("tournament_id").notNull().references(() => tournament.id),
    name: text("name").notNull(),
    // Token of the plugin of the slot
    token: text("token").notNull().unique('slot_token').default(sql`(hex(randomblob(38)))`),
    versusId: integer("versus_id").references(() => versus.id, { onDelete: "set null" }),
    enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`).$onUpdate(() => sql`(CURRENT_TIMESTAMP)`)
});

export type Slot = InferSelectModel<typeof slot>;
