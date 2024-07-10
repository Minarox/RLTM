import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import type {BunSQLiteDatabase} from "drizzle-orm/bun-sqlite/driver";

export default function database():  BunSQLiteDatabase<Record<string, never>> {
    const sqlite: Database = new Database("sqlite.db");
    sqlite.exec("PRAGMA journal_mode = WAL;");

    return drizzle(sqlite);
}
