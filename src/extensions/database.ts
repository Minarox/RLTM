import { Database } from "bun:sqlite";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import { arena } from "../database/schemas/arena.ts";
import { car } from "../database/schemas/car.ts";
import { match } from "../database/schemas/match.ts";
import { player } from "../database/schemas/player.ts";
import { season } from "../database/schemas/season.ts";
import { statistic } from "../database/schemas/statistic.ts";
import { team } from "../database/schemas/team.ts";
import { tournament } from "../database/schemas/tournament.ts";
import { versus } from "../database/schemas/versus.ts";

let db: BunSQLiteDatabase<any> | null = null;

function database(): BunSQLiteDatabase<any> {
    if (!db) {
        const sqlite: Database = new Database("sqlite.db", { create: true });
        sqlite.exec("PRAGMA journal_mode = WAL;");

        db = drizzle(sqlite, { schema: { ...arena, ...car, ...match, ...player, ...season, ...statistic, ...team, ...tournament, ...versus } });
        migrate(db, { migrationsFolder: "src/database/migrations" });
    }

    return db;
}

export default database();
