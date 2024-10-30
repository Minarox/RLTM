import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";
import { compression } from "elysia-compression";
import overlay from "./controllers/overlay.ts";
import plugin from "./controllers/plugin.ts";
import scoreboard, { getCurrentScoreboard } from "./controllers/scoreboard.ts";
import statistics from "./controllers/statistics.ts";
import versus from "./controllers/versus.ts";
import { getCurrentMatch } from "./database/queries/match.ts";
import { getCurrentSeason } from "./database/queries/season.ts";
import { getCurrentStatistics } from "./database/queries/statistic.ts";
import { getTournaments } from "./database/queries/tournament.ts";
import { getCurrentVersus } from "./database/queries/versus.ts";
import { type Tournament } from "./database/schemas/tournament.ts";
import app from "./extensions/app.ts";
import { Topic, type Store } from "./types/app.ts";

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

    .use(plugin)
    .use(overlay)
    .use(statistics)
    .use(versus)
    .use(scoreboard)

    .get('/version', ({ store }) => store.version)

    .onStart(({ server }): void => {
        console.clear();

        getTournaments()
            .forEach((tournament: Tournament): void => {
                if (!tournament.enabled) return;

                const season = getCurrentSeason(tournament.id) || null;
                const versus = season && getCurrentVersus(season.id) || null;
                const match = versus && getCurrentMatch(versus.id) || null;
                const statistics = match && getCurrentStatistics(match.id) || null;
                const scoreboard = season && getCurrentScoreboard(season.id) || null;

                app.state(tournament.id, {
                    [Topic.TOURNAMENT]: tournament,
                    [Topic.SEASON]: season,
                    [Topic.VERSUS]: versus,
                    [Topic.MATCH]: match,
                    [Topic.STATISTICS]: statistics,
                    [Topic.PLAYERS]: null,
                    [Topic.SCOREBOARD]: scoreboard,
                    [Topic.PLUGIN]: null
                } as Store);
            });

        app.decorator.log.info(`🚀 RLTM is running at ${server?.url}.`);
    })
    .listen(3300);
