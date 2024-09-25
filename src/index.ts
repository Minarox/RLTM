import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";
import { compression } from "elysia-compression";
import live from "./controllers/live.ts";
import { getCurrentSeason } from "./database/queries/season.ts";
import { getTournaments } from "./database/queries/tournament.ts";
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
        prefix: "/"
    }))
    .use(app)

    .use(live)

    .onStart(({ server }): void => {
        console.clear();

        getTournaments()
            .forEach((tournament): void => {
                app.state(tournament.id, {
                    tournament: tournament,
                    season: getCurrentSeason(tournament.id) || null,
                    game: null,
                    match: null,
                    statistics: null,
                    plugin: null
                } as Store);
            });

        app.decorator.log.info(`🚀 RLTM is running at ${server?.url}.`);
    })
    .listen(3300);
