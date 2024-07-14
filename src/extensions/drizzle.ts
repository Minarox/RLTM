import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import type {BunSQLiteDatabase} from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

export default function database(): BunSQLiteDatabase {
    const sqlite: Database = new Database("database/sqlite.db", { create: true });
    sqlite.exec("PRAGMA journal_mode = WAL;");
    const db: BunSQLiteDatabase = drizzle(sqlite);

    migrate(db, {migrationsFolder: "database/migrations"});

    return db;
}
