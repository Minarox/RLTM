import { Elysia } from "elysia";
import app from "./extensions/app.ts";
import plugin from "./controllers/plugin.ts";
import live from "./controllers/live.ts";
import { getTournaments } from "./database/queries/tournament.ts";
import { getCurrentSeason } from "./database/queries/season.ts";

new Elysia({
    name: "RLTM"
})
    .use(app)

    .use(plugin)
    .use(live)

    .onStart(({ server }): void => {
        console.clear();

        getTournaments()
            .forEach((tournament): void => {
                app.state(tournament.token, {
                    tournament: tournament,
                    season: getCurrentSeason(tournament.id) || null,
                    game: null,
                    match: null,
                    statistics: null
                });
            });

        app.decorator.log.info(`🚀 RLTM is running at ${server?.url}.`);
    })
    .listen(3000);
