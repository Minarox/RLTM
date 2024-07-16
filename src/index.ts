import { Elysia } from "elysia";
import drizzle from "./extensions/drizzle.ts";
import logestic from "./extensions/logestic.ts";
import compression from "./extensions/compression.ts";

import { game } from "./controllers/game.ts";

export const app = new Elysia({
    websocket: {
        perMessageDeflate: true,
        idleTimeout: 10
    }
})
    // Extensions
    .state("version", "1.0.0")
    .decorate('db', drizzle())
    .use(logestic)
    .use(compression)

    // Routes
    .get("/", "Hello World")
    .get("/version", ({ store }): string => store.version)

    // Controllers
    .use(game)

    // Start the server
    .onStart(({ server, decorator }): void =>  {
        console.clear();
        decorator.logestic.info(`🏎️ RLTM is running at ${server?.url}.`)
    })
    .listen(3000);
