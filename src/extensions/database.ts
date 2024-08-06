import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

let db: BunSQLiteDatabase | null = null;

function database(): BunSQLiteDatabase {
    if (!db) {
        const sqlite: Database = new Database("src/database/sqlite.db", { create: true });
        sqlite.exec("PRAGMA journal_mode = WAL;");

        db = drizzle(sqlite);
        migrate(db, { migrationsFolder: "src/database/migrations" });
    }

    return db;
}

export default database();
