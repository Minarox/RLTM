import type { Config } from "drizzle-kit";

// Run from packages/db (bun run db:migrate): drizzle-kit loads this file without import.meta
export default {
    dialect: "sqlite",
    schema: "./src/schemas",
    out: "./src/migrations",
    dbCredentials: {
        url: `file:${process.env['DATABASE_URL']?.replace(/^file:/, "") ?? "../../apps/realtime/sqlite.db"}`,
    },
    strict: true,
    verbose: true
} satisfies Config;
