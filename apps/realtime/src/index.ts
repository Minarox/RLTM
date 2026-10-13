import cron from "@elysiajs/cron";
import { staticPlugin } from "@elysiajs/static";
import { checkTournamentById, db, setLogger } from "@rltm/db";
import { PLUGIN_PROTOCOL } from "@rltm/shared";
import { Elysia, t } from "elysia";
import overlay from "./controllers/overlay.ts";
import plugin from "./controllers/plugin.ts";
import results from "./controllers/results.ts";
import statistics from "./controllers/statistics.ts";
import versus from "./controllers/versus.ts";
import logger from "./extensions/logger.ts";
import { setServer } from "./live/bus.ts";
import { loadStore, store as liveStore } from "./live/store.ts";
import { assetsDir } from "./paths.ts";

setLogger(logger);

export const app = new Elysia({
    name: "RLTM",
    websocket: {
        perMessageDeflate: true,
        idleTimeout: 3
    }
})
    .use(
        staticPlugin({
            assets: assetsDir,
            alwaysStatic: true,
            noExtension: false,
            noCache: process.env['NODE_ENV'] === "development",
            directive: process.env['NODE_ENV'] === "development" ? "no-cache" : "public",
            indexHTML: false,
            prefix: 'assets',
        })
    )
    .use(
        cron({
            name: 'updateStore',
            pattern: '0 0 0 * * *',
            run() {
                if (process.env.NODE_ENV === "test") return;
                loadStore();
            }
        })
    )
    .decorate({
        log: logger,
        db: db
    })

    .state("version", "1.0.0")
    .state("plugin_protocol", PLUGIN_PROTOCOL)

    .get('/version', ({ store }) => store.version)

    .use(plugin)

    .group(
        "/:tournamentId",
        {
            params: t.Object({
                tournamentId: t.String(),
            })
        },
        (group) => group
            .guard({
                beforeHandle({ set, params, path, headers, request, log }) {
                    if (headers["upgrade"] !== "websocket") {
                        log.http(`${request.method} ${path}`);
                    }

                    if (!(liveStore.hasOwnProperty(params["tournamentId"]) && checkTournamentById(params["tournamentId"]))) {
                        log.warn(`⚠️ Tournament ${params["tournamentId"]} not found in database.`);

                        set.status = "Not Found";
                        return "NOT_FOUND";
                    }
                },
            })

            .use(overlay)
            .use(statistics)
            .use(versus)
            .use(results)
    )

    .onError(({ error, request, code, server, log }): void => {
        const origin: string = server?.url?.origin ?? '';
        const path: string = request.url.slice(origin.length);

        log.error(`${request.method} ${path} ${code} | ${error}`);
    })
    .onStart(({ server, decorator }): void => {
        if (process.env.NODE_ENV === "test") return;
        console.clear();
        decorator.log.info(`🚀 RLTM is running at ${server?.url}`);
    })
    .listen(3300);

setServer(app.server);
loadStore();

export type App = typeof app;
