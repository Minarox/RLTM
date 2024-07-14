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

    .get("/", (): string => {
        return 'Hello World';
    })

    // Start the server
    .onError(({ error, logestic }): void => {
        logestic.error(error?.message);
    })
    .onStart(({ server, decorator }): void =>  {
        decorator.logestic.info(`🏎️ RLTM is running at ${server?.url}.`)
    })
    .listen(3000);
