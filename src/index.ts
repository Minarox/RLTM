import cron from "@elysiajs/cron";
import { staticPlugin } from "@elysiajs/static";
import { Elysia, t } from "elysia";
import overlay from "./controllers/overlay.ts";
import plugin from "./controllers/plugin.ts";
import results, { getResults } from "./controllers/results.ts";
import statistics from "./controllers/statistics.ts";
import versus from "./controllers/versus.ts";
import { getCurrentMatch } from "./database/queries/match.ts";
import { getCurrentSeason } from "./database/queries/season.ts";
import { getCurrentStatistics } from "./database/queries/statistic.ts";
import { getTeamsBySeasonId } from "./database/queries/team.ts";
import { checkTournamentById, getTournaments } from "./database/queries/tournament.ts";
import { getCurrentVersus } from "./database/queries/versus.ts";
import { type Tournament } from "./database/schemas/tournament.ts";
import database from "./extensions/database.ts";
import logger from "./extensions/logger.ts";
import { pluginStateTopics, Topic, type Store } from "./types/app.ts";
import { PLUGIN_PROTOCOL } from "./types/plugin.ts";

function loadStore(): void {
    getTournaments()
        .forEach((tournament: Tournament): void => {
            if (!tournament.enabled) return;

            const oldData = app.store[tournament.id] ? Object.assign({}, app.store[tournament.id]) : null;
            const season = getCurrentSeason(tournament.id) || null;
            const teams = season && getTeamsBySeasonId(season.id) || null;
            const results = season && getResults(season.id) || null;
            const versus = season && getCurrentVersus(season.id) || null;
            const match = versus && getCurrentMatch(versus.id) || null;
            const statistics = match && getCurrentStatistics(match.id) || null;

            app.state(tournament.id, {
                [Topic.TOURNAMENT]: tournament,
                [Topic.SEASON]: season,
                [Topic.TEAMS]: teams,
                [Topic.RESULTS]: results,
                [Topic.VERSUS]: versus,
                [Topic.MATCH]: match,
                [Topic.STATISTICS]: statistics,
                // States received from the plugin
                ...Object.fromEntries(pluginStateTopics.map((topic) => [topic, oldData ? oldData[topic] : null])),
                connection: oldData ? oldData.connection : null
            } as Store);

            app.decorator.log.verbose(`🏬 ${oldData ? 'Update' : 'Load'} tournament "${tournament.name}" in store`);

            if (oldData) {
                // @ts-ignore
                const server = app.getServer();
                Object.keys(oldData)
                    .forEach((key) => {
                        if (JSON.stringify(oldData[key]) !== app.store[tournament.id][key]) {
                            server?.publish(`${tournament.id}_${key}`, JSON.stringify({ [key]: app.store[tournament.id][key] || null }));
                        }
                    })
            }
        });
}

export const app = new Elysia({
    name: "RLTM",
    websocket: {
        perMessageDeflate: true,
        idleTimeout: 3
    }
})
    .use(
        staticPlugin({
            assets: 'assets',
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
        db: database
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
                beforeHandle({ set, params, path, headers, request, log, store }) {
                    if (headers["upgrade"] !== "websocket") {
                        log.http(`${request.method} ${path}`);
                    }

                    if (!(store.hasOwnProperty(params["tournamentId"]) && checkTournamentById(params["tournamentId"]))) {
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

loadStore();
