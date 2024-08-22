import { Elysia } from "elysia";
import logger from "./logger.ts";
import database from "./database.ts";
import { EventEmitter } from "events";

const app = new Elysia({
    name: "App"
})
    .decorate({
        log: logger,
        db: database,
        event: new EventEmitter()
    })

    .state("version", process.env['npm_package_version'])

    .onRequest(({ request, server, log }): void => {
        const origin: string = server?.url?.origin ?? '';
        const path: string = request.url.slice(origin.length);

        log.http(`${request.method} ${path}`);
    })

    .onError(({ error, request, code, server, log }): void => {
        const origin: string = server?.url?.origin ?? '';
        const path: string = request.url.slice(origin.length);

        log.error(`${request.method} ${path} ${code} | ${error}`);
    });

export default app;
