import { Elysia } from "elysia";
import compression from "./extensions/compression.ts";
import logestic from "./extensions/logestic.ts";
import drizzle from "./extensions/drizzle.ts";
import {sql} from "drizzle-orm";

import game from "./controllers/game.ts";

export const app = new Elysia()
    // Extensions
    .use(compression)
    .use(logestic)
    .decorate('db', drizzle())
    .decorate('sql', sql)

    // Controllers
    .use(game)

    .get("/", ({ logestic, db, sql }): string => {
        logestic.info("Hello World!");
        const query = sql`select "Hello World!" as text`;
        return db.get<string[]>(query)[0];
    })

    // Start the server
    .onStart((app): void =>  {
        console.log(`🏎️ RLTM is running at http://${app.server?.hostname}:${app.server?.port}`)
    })
    .listen(3000);
