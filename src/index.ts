import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";
import { compression } from "elysia-compression";
import main from "./controllers/main.ts";
import overlay from "./controllers/overlay.ts";
import statistics from "./controllers/statistics.ts";
import versus from "./controllers/versus.ts";
import { getCurrentMatch } from "./database/queries/match.ts";
import { getCurrentSeason } from "./database/queries/season.ts";
import { getTournaments } from "./database/queries/tournament.ts";
import { getCurrentVersus } from "./database/queries/versus.ts";
import app from "./extensions/app.ts";
import type { Store } from "./types/store.ts";

new Elysia({
    name: "RLTM"
})
    .use(compression({
        type: 'gzip',
        options: {
            level: 9,
            memLevel: 9
        }
    }))
    .use(staticPlugin({
        assets: 'assets',
        alwaysStatic: true,
        noExtension: false,
        noCache: process.env['NODE_ENV'] === "development",
        directive: process.env['NODE_ENV'] === "development" ? "no-cache" : "public",
        indexHTML: false,
        prefix: '/assets/',
    }))
    .use(app)

    .use(main)
    .use(overlay)
    .use(statistics)
    .use(versus)

    .get('/version', ({ store }) => store.version)

    .onStart(({ server }): void => {
        console.clear();

        getTournaments()
            .forEach((tournament): void => {
                if (!tournament.enabled) return;
                const season = getCurrentSeason(tournament.id);
                const versus = getCurrentVersus(tournament.id);
                const match = getCurrentMatch(tournament.id);

                app.state(tournament.id, {
                    tournament: tournament,
                    season: season || null,
                    versus: versus || null,
                    match: match || null,
                    players: null,
                    statistics: null,
                    plugin: null
                } as Store);
            });

        app.decorator.log.info(`🚀 RLTM is running at ${server?.url}.`);
    })
    .listen(3300);
