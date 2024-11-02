import type { Config } from "drizzle-kit";

export default {
    dialect: "sqlite",
    schema: "./src/database/schemas",
    out: "./src/database/migrations",
    dbCredentials: {
        url: "file:sqlite.db",
    },
    strict: true,
    verbose: true
} satisfies Config;
