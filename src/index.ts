import { Elysia } from "elysia";
import logestic from "./plugins/logestic.ts";
import { compression } from 'elysia-compression'
import sqlite from "./plugins/sqlite.ts";

import game from "./controllers/game.ts";

export const app = new Elysia()
    // Extensions
    .use(logestic)
    .use(compression())
    .decorate('db', sqlite())

    // Controllers
    .use(game)

    .get("/", ({ db }): string => JSON.stringify(db.query("SELECT * FROM players").all(), null, 4))

    // Start the server
    .onStart((app): void =>  {
        console.log(`🏎️ RLTM is running at http://${app.server?.hostname}:${app.server?.port}`)
    })
    .listen(3000);
