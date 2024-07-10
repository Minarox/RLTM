import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import type {BunSQLiteDatabase} from "drizzle-orm/bun-sqlite";

export default function database():  BunSQLiteDatabase {
    const sqlite: Database = new Database("sqlite.db");
    sqlite.exec("PRAGMA journal_mode = WAL;");

    return drizzle(sqlite);
}
