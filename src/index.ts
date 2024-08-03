import { Elysia } from "elysia";
import logger from "./extensions/logger.ts";
import drizzle from "./extensions/drizzle.ts";
import files from "./extensions/files.ts";
import compression from "./extensions/compression.ts";

import { game } from "./controllers/game.ts";

export const app = new Elysia({
    websocket: {
        perMessageDeflate: true,
        idleTimeout: 10
    }
})
    // Extensions
    .decorate('log', logger)
    .decorate('db', drizzle())
    .use(files)
    .use(compression)

    // Controllers
    .use(game)

    .onStart(({ server, decorator }): void =>  {
        console.clear();
        decorator.log.info(`🚀 RLTM is running at ${server?.url}.`)
    })
    .onRequest(({ request, server, log }): void => {
        const origin: string = server?.url?.origin ?? '';
        const path: string = request.url.slice(origin.length);

        log.http(`${request.method} ${path}`);
    })
    .onError(({ error, request, code, server, log }): void => {
        const origin: string = server?.url?.origin ?? '';
        const path: string = request.url.slice(origin.length);

        log.error(`${request.method} ${path} ${code} | ${error}`);
    })
    .listen(3000);
