// Messages of the RLTM Bridge plugin, protocol 2: https://github.com/Minarox/RLTM-Bridge (docs/protocol)

export const PLUGIN_PROTOCOL = 2;

export interface PluginMessage {
    topic: string;
    payload: unknown;
}

export interface PluginInfoPayload {
    version: string;
    protocol: number;
    client: string;
}

export interface PlayerReference {
    uid: string;
    name: string;
    bot: boolean;
    teamIndex: number;
}

export interface MatchTeam {
    index: number;
    name: string | null;
    primaryColor: string;
    secondaryColor: string;
}

export interface MatchPayload {
    guid: string | null;
    arenaCode: string;
    score: Array<number>;
    teams: Array<MatchTeam>;
    clock: number;
    duration: number;
    isUnlimited: boolean;
    isStarted: boolean;
    isPaused: boolean;
    isOvertime: boolean;
    isEnded: boolean;
    isReplay: boolean;
}

export interface PlayersPayload extends PlayerReference {
    carId: number;
}

export interface ScoreboardPlayer extends PlayerReference {
    mvp: boolean;
    score: number;
    goals: number;
    shots: number;
    assists: number;
    saves: number;
    ballTouches: number;
    carTouches: number;
    // Stat events received for the player (Demolish, EpicSave...), a missing event is 0
    events: { [eventName: string]: number };
}

// Indexed by "<uid>|<name>", {} before the start of the match
export type ScoreboardPayload = { [playerKey: string]: ScoreboardPlayer };

export interface StatsPlayer extends PlayerReference {
    boostPickups: number;
    boostUsed: number;
    timeInPlay: number;
    timeSupersonic: number;
    timeOnGround: number;
    timeOnWall: number;
    timeInAir: number;
    averageSpeed: number;
}

export type StatsPayload = { [playerKey: string]: StatsPlayer };

export interface SpectatorPayload {
    camera: string;
    target: PlayerReference | null;
}

export interface StatisticPayload {
    uid: string;
    name: string;
    bot: boolean;
    eventName: string;
}

export interface EntitiesPayload {
    time: number;
    balls: Array<Ball>;
    cars: Array<Car>;
}

export interface Ball {
    speed: number;
    location: Array<number>;
}

export interface Car extends PlayerReference {
    speed: number;
    location: Array<number>;
    isSuperSonic: boolean;
    isOnWall: boolean;
    isOnGround: boolean;
    isInGoal: boolean;
    isDodging: boolean;
    hasFlip: boolean;
    boost: number;
}

export type EventPayload =
    | { type: "kickoff" | "overtime" | "replayStart" | "replayEnd" | "podium"; clock: number }
    | {
        type: "goal";
        clock: number;
        teamIndex: number;
        scorer: PlayerReference | null;
        assister: PlayerReference | null;
        isOwnGoal: boolean;
        ballSpeed: number;
    }
    | { type: "matchEnded"; clock: number; winner: number | null; score: Array<number> };

export interface ResultPayload {
    guid: string | null;
    client: string;
    endedAt: number;
    arenaCode: string;
    duration: number;
    timePlayed: number;
    isOvertime: boolean;
    score: Array<number>;
    winner: number | null;
    mvp: PlayerReference | null;
    teams: Array<MatchTeam>;
    scoreboard: ScoreboardPayload;
    stats: StatsPayload | null;
    replayName: string | null;
}

export interface ResponsePayload {
    command: string | null;
    id: string | number | null;
    success: boolean;
    error?: string;
    result?: any;
}

export interface PluginCommand {
    command: string;
    payload?: { [key: string]: unknown };
    id?: string | number;
}
