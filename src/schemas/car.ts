import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const car = sqliteTable("car", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    picture: blob("picture").notNull(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});

export interface Car {
    id: number;
    name: string;
    picture: Uint8Array;
    createdAt: string;
}
