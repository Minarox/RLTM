import type { Config } from "drizzle-kit";
import { getDatabasePath } from "./src/path.ts";

export default {
    dialect: "sqlite",
    schema: "./src/schemas",
    out: "./src/migrations",
    dbCredentials: {
        url: `file:${getDatabasePath()}`,
    },
    strict: true,
    verbose: true
} satisfies Config;
