import { isAbsolute, join, resolve } from "node:path";

export const migrationsFolder: string = join(import.meta.dir, "migrations");

// DATABASE_URL (relative to the working directory), sqlite.db at the root of apps/realtime by default
export function getDatabasePath(): string {
    const url = process.env['DATABASE_URL']?.replace(/^file:/, "");
    if (url) return isAbsolute(url) ? url : resolve(process.cwd(), url);

    return resolve(import.meta.dir, "../../../apps/realtime/sqlite.db");
}
