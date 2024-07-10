import { Elysia } from "elysia";
import compression from "./extensions/compression.ts";
import logestic from "./extensions/logestic.ts";
import drizzle from "./extensions/drizzle.ts";

import game from "./controllers/game.ts";

export const app = new Elysia()
    // Extensions
    .use(logestic)
    .use(compression)
    .decorate('db', drizzle())

    // Controllers
    .use(game)

    .get("/", (): string => "Hello World!")

    // Start the server
    .onStart((app): void =>  {
        console.log(`🏎️ RLTM is running at http://${app.server?.hostname}:${app.server?.port}`)
    })
    .listen(3000);
