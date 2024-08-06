import { Elysia } from "elysia";
import { compression } from "elysia-compression";
import { staticPlugin } from "@elysiajs/static";
import logger from "./logger.ts";
import database from "./database.ts";
import { EventEmitter } from "events";

const app = new Elysia({
    name: "App"
})
    .use(compression({
        type: 'gzip',
        options: {
            level: 9,
            memLevel: 9
        }
    }))
    .use(staticPlugin({
        assets: "public",
        prefix: "/"
    }))
    .use(staticPlugin({
        assets: "interface",
        prefix: "/"
    }))

    .decorate({
        log: logger,
        db: database,
        event: new EventEmitter()
    })

    .state("version", "1.0.0")

    .onRequest(({ request, server, log }): void => {
        const origin: string = server?.url?.origin ?? '';
        const path: string = request.url.slice(origin.length);

        log.http(`${request.method} ${path}`);
    })

    .onError(({ error, request, code, server, log }) => {
        const origin: string = server?.url?.origin ?? '';
        const path: string = request.url.slice(origin.length);

        log.error(`${request.method} ${path} ${code} | ${error}`);
    });

export default app;
