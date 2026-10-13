// Messages of the RLTM Bridge plugin (protocol 2), from the examples of its documentation

export const pluginMessage = {
    topic: "plugin",
    payload: { version: "1.1.0.42", protocol: 2, client: "PC-CASTER-1" }
};

export const playersMessage = {
    topic: "players",
    payload: [
        { uid: "Steam|76561198000000001|0", name: "Player1", bot: false, teamIndex: 0, carId: 23 },
        { uid: "Steam|76561198000000002|0", name: "Player2", bot: false, teamIndex: 1, carId: 4284 },
        { uid: "Steam|76561198000000003|0", name: "Caster", bot: false, teamIndex: 255, carId: 23 }
    ]
};

export const matchMessage = {
    topic: "match",
    payload: {
        guid: "8A5B3C4D2E1F",
        arenaCode: "Stadium_P",
        score: [1, 0],
        teams: [
            { index: 0, name: null, primaryColor: "#1873FF", secondaryColor: "#E5E5E5" },
            { index: 1, name: null, primaryColor: "#FF7B00", secondaryColor: "#E5E5E5" }
        ],
        clock: 183,
        duration: 300,
        isUnlimited: false,
        isStarted: true,
        isPaused: false,
        isOvertime: false,
        isEnded: false,
        isReplay: false
    }
};

export const scoreboardPlayer = {
    uid: "Steam|76561198000000001|0",
    name: "Player1",
    bot: false,
    teamIndex: 0,
    mvp: false,
    score: 320,
    goals: 1,
    shots: 2,
    assists: 0,
    saves: 1,
    ballTouches: 24,
    carTouches: 3,
    events: { Shot: 2, Goal: 1, Save: 1, Demolish: 2, KO_DoubleKO: 1 }
};

export const scoreboardMessage = {
    topic: "scoreboard",
    payload: { "Steam|76561198000000001|0|Player1": scoreboardPlayer }
};

export const spectatorMessage = {
    topic: "spectator",
    payload: {
        camera: "Default",
        target: { uid: "Steam|76561198000000001|0", name: "Player1", bot: false, teamIndex: 0 }
    }
};

export const goalMessage = {
    topic: "event",
    payload: {
        type: "goal",
        clock: 183,
        teamIndex: 0,
        scorer: { uid: "Steam|76561198000000001|0", name: "Player1", bot: false, teamIndex: 0 },
        assister: null,
        isOwnGoal: false,
        ballSpeed: 112
    }
};
