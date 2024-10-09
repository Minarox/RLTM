import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";
import { compression } from "elysia-compression";
import live from "./controllers/live.ts";
import { getCurrentSeason } from "./database/queries/season.ts";
import { getTournaments } from "./database/queries/tournament.ts";
import { getCurrentVersusRecursive } from "./database/queries/versus.ts";
import app from "./extensions/app.ts";
import type { MatchPayload, StatisticsPayload } from "./types/plugin.ts";
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
                const season = getCurrentSeason(tournament.id) || null;
                const versus = season ? getCurrentVersusRecursive(season.id) : null;
                const match = {
                    duration: 300,
                    id: 1234567890,
                    isEnded: 0,
                    isOvertime: 0,
                    isPaused: 0,
                    isReplay: 0,
                    isStarted: 1,
                    isUnlimited: 0,
                    map: "EuroStadium_P",
                    score: [0, 2],
                    time: 147
                } as MatchPayload;
                const statistics = [
                    {
                        "assists": 1,
                        "ballTouches": 14,
                        "car": {
                            "asFlip": 1,
                            "boost": 0.12156863510608673,
                            "isDodging": false,
                            "isInGoal": 0,
                            "isOnGround": true,
                            "isOnWall": false,
                            "isSuperSonic": 0,
                            "speed": 51.2075309753418
                        },
                        "carTouches": 28,
                        "demolishes": 0,
                        "goals": 0,
                        "mvp": 0,
                        "name": "Heater",
                        "ownGoals": 0,
                        "saves": 0,
                        "score": 122,
                        "shots": 1,
                        "team": 1,
                        "uid": "Unknown|0|0"
                    },
                    {
                        "assists": 0,
                        "ballTouches": 9,
                        "car": {
                            "asFlip": 1,
                            "boost": 0.45488229393959045,
                            "isDodging": false,
                            "isInGoal": 0,
                            "isOnGround": true,
                            "isOnWall": false,
                            "isSuperSonic": 1,
                            "speed": 83.29965209960938
                        },
                        "carTouches": 17,
                        "demolishes": 0,
                        "goals": 0,
                        "mvp": 0,
                        "name": "Poncho",
                        "ownGoals": 0,
                        "saves": 0,
                        "score": 58,
                        "shots": 0,
                        "team": 0,
                        "uid": "Unknown|0|0"
                    },
                    {
                        "assists": 0,
                        "ballTouches": 16,
                        "car": {
                            "asFlip": 1,
                            "boost": 0.3019607961177826,
                            "isDodging": true,
                            "isInGoal": 0,
                            "isOnGround": false,
                            "isOnWall": false,
                            "isSuperSonic": 0,
                            "speed": 74.50143432617188
                        },
                        "carTouches": 23,
                        "demolishes": 0,
                        "goals": 0,
                        "mvp": 0,
                        "name": "Sticks",
                        "ownGoals": 0,
                        "saves": 0,
                        "score": 38,
                        "shots": 1,
                        "team": 0,
                        "uid": "Unknown|0|0"
                    },
                    {
                        "assists": 1,
                        "ballTouches": 23,
                        "car": {
                            "asFlip": 1,
                            "boost": 0.950127124786377,
                            "isDodging": false,
                            "isInGoal": 0,
                            "isOnGround": true,
                            "isOnWall": false,
                            "isSuperSonic": 0,
                            "speed": 43.15904998779297
                        },
                        "carTouches": 17,
                        "demolishes": 0,
                        "goals": 1,
                        "mvp": 0,
                        "name": "Hollywood",
                        "ownGoals": 0,
                        "saves": 0,
                        "score": 232,
                        "shots": 2,
                        "team": 1,
                        "uid": "Unknown|0|0"
                    },
                    {
                        "assists": 0,
                        "ballTouches": 11,
                        "car": {
                            "asFlip": 1,
                            "boost": 0.08688045293092728,
                            "isDodging": false,
                            "isInGoal": 0,
                            "isOnGround": true,
                            "isOnWall": false,
                            "isSuperSonic": 0,
                            "speed": 16.281415939331055
                        },
                        "carTouches": 27,
                        "demolishes": 0,
                        "goals": 0,
                        "mvp": 0,
                        "name": "Iceman",
                        "ownGoals": 0,
                        "saves": 1,
                        "score": 60,
                        "shots": 0,
                        "team": 0,
                        "uid": "Unknown|0|0"
                    },
                    {
                        "assists": 0,
                        "ballTouches": 20,
                        "car": {
                            "asFlip": 1,
                            "boost": 0,
                            "isDodging": true,
                            "isInGoal": 0,
                            "isOnGround": false,
                            "isOnWall": false,
                            "isSuperSonic": 0,
                            "speed": 34.391151428222656
                        },
                        "carTouches": 28,
                        "demolishes": 0,
                        "goals": 1,
                        "mvp": 0,
                        "name": "Cougar",
                        "ownGoals": 0,
                        "saves": 1,
                        "score": 222,
                        "shots": 2,
                        "team": 1,
                        "uid": "Unknown|0|0"
                    }
                ] as StatisticsPayload[];

                app.state(tournament.id, {
                    tournament: tournament,
                    season: season,
                    versus: versus,
                    match: match,
                    statistics: statistics,
                    plugin: null
                } as Store);
            });

        app.decorator.log.info(`🚀 RLTM is running at ${server?.url}.`);
    })
    .listen(3300);
