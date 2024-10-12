import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";
import { compression } from "elysia-compression";
import live from "./controllers/live.ts";
import { getCurrentSeason } from "./database/queries/season.ts";
import { getTournaments } from "./database/queries/tournament.ts";
import { getCurrentVersusRecursive } from "./database/queries/versus.ts";
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
        prefix: "/",
        alwaysStatic: true,
        indexHTML: false
    }))
    .use(app)

    .use(live)

    .get('/version', ({ store }) => store.version)

    .onStart(({ server }): void => {
        console.clear();

        getTournaments()
            .forEach((tournament): void => {
                if (!tournament.enabled) return;
                const season = getCurrentSeason(tournament.id) || null;
                const versus = season ? getCurrentVersusRecursive(season.id) : null;

                app.state(tournament.id, {
                    tournament: tournament,
                    season: season,
                    versus: versus,
                    match: null,
                    players: null,
                    statistics: null,
                    plugin: null
                } as Store);
            });

        app.decorator.log.info(`🚀 RLTM is running at ${server?.url}.`);
    })
    .listen(3300);
