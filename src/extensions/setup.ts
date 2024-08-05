import { Elysia } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { compression } from "elysia-compression";
import { staticPlugin } from "@elysiajs/static";
import logger from "./logger.ts";
import drizzle from "./drizzle.ts";
import { EventEmitter } from "events";

const setup = new Elysia({
    name: "Setup"
})
    .use(HttpStatusCode())
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

    .decorate('log', logger)
    .decorate('db', drizzle())
    .decorate('event', new EventEmitter())

    .state("version", "1.0.0")
    .state("match", null)
    .state("statistics", null)

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

export default setup;
