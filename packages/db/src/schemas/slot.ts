import { type InferSelectModel, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { tournament } from "./tournament.ts";
import { versus } from "./versus.ts";

// Broadcast slot of a tournament: a game PC with its plugin and its overlays, showing one versus
export const slot = sqliteTable("slot", {
    id: text("id").primaryKey().default(sql`(hex(randomblob(8)))`),
    tournamentId: text("tournament_id").notNull().references(() => tournament.id),
    name: text("name").notNull(),
    // Token of the plugin of the slot
    token: text("token").notNull().unique('slot_token').default(sql`(hex(randomblob(38)))`),
    // A versus is shown by one slot at most (NULL values aren't unique)
    versusId: integer("versus_id").unique('slot_versus').references(() => versus.id, { onDelete: "set null" }),
    enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`).$onUpdate(() => sql`(CURRENT_TIMESTAMP)`)
}, (table) => [
    index("slot_tournament").on(table.tournamentId)
]);

export type Slot = InferSelectModel<typeof slot>;
