import { Database } from "bun:sqlite";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { getDatabasePath, migrationsFolder } from "./path.ts";

import { arena } from "./schemas/arena.ts";
import { car } from "./schemas/car.ts";
import { match } from "./schemas/match.ts";
import { player } from "./schemas/player.ts";
import { season } from "./schemas/season.ts";
import { statistic } from "./schemas/statistic.ts";
import { team } from "./schemas/team.ts";
import { tournament } from "./schemas/tournament.ts";
import { versus } from "./schemas/versus.ts";

let db: BunSQLiteDatabase<any> | null = null;

function database(): BunSQLiteDatabase<any> {
    if (!db) {
        const sqlite: Database = new Database(getDatabasePath(), { create: true });
        sqlite.exec("PRAGMA journal_mode = WAL;");

        db = drizzle(sqlite, { schema: { ...arena, ...car, ...match, ...player, ...season, ...statistic, ...team, ...tournament, ...versus } });
        migrate(db, { migrationsFolder });
    }

    return db;
}

export default database();
