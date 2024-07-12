import { Elysia } from "elysia";
import compression from "./extensions/compression.ts";
import logger from "./extensions/logger.ts";
import drizzle from "./extensions/drizzle.ts";
import { sql } from "drizzle-orm";

import game from "./controllers/game.ts";

export const log = logger;

export const app = new Elysia()
    // Extensions
    .use(log.into())
    .use(compression)
    .decorate('db', drizzle())
    .decorate('sql', sql)

    // Controllers
    .use(game)

    .get("/", ({ db, sql, log }): string => {
        log.info("Hello World!");
        const query = sql`select "Hello World!" as text`;
        return db.get<string[]>(query)[0];
    })

    // Start the server
    .onStart((app): void =>  {
        console.log(`🏎️ RLTM is running at http://${app.server?.hostname}:${app.server?.port}`)
    })
    .listen(3000);
