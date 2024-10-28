import type { Arena } from "../database/schemas/arena";

export enum Topic {
    TOURNAMENT = "tournament",
    SEASON = "season",
    VERSUS = "versus",
    MATCH = "match",
    PLAYERS = "players",
    STATISTICS = "statistics",
    STATISTIC = "statistic",
    ENTITIES = "entities",
    PLUGIN = "plugin"
}

export interface MatchPayload {
    arenaCode: string;
    score: Array<number>;
    duration: number;
    isUnlimited: boolean;
    isStarted: boolean;
    isPaused: boolean;
    isOvertime: boolean;
    isEnded: boolean;
    isReplay: boolean;
    statistics: StatisticsPayload[];
    clock: number;
    map?: Arena;
}

export interface PlayersPayload {
    uid: string;
    name: string;
    bot: boolean;
    teamIndex: number;
    carId: number;
}

export interface StatisticsPayload {
    uid: string;
    name: string;
    bot: boolean;
    teamIndex: number;
    mvp: boolean;
    score: number;
    goals: number;
    shots: number;
    assists: number;
    saves: number;
    ballTouches: number;
    carTouches: number;

    Demolish: number;
    Demolition: number;
    AerialGoal: number;
    BackwardsGoal: number;
    BicycleGoal: number;
    LongGoal: number;
    TurtleGoal: number;
    PoolShot: number;
    OvertimeGoal: number;
    HatTrick: number;
    Playmaker: number;
    EpicSave: number;
    Savior: number;
    Center: number;
    Clear: number;
    FirstTouch: number;
    BreakoutDamage: number;
    BreakoutDamageLarge: number;
    LowFive: number;
    HighFive: number;
    HoopsSwishGoal: number;
    BicycleHit: number;
    OwnGoal: number;
    KO_Winner: number;
    KO_Knockout: number;
    KO_DoubleKO: number;
    KO_TripleKO: number;
    KO_Death: number;
    KO_LightHit: number;
    KO_HeavyHit: number;
    KO_AerialLightHit: number;
    KO_AerialHeavyHit: number;
    KO_HitTaken: number;
    KO_BlockTaken: number;
    KO_Grabbed: number;
    KO_Thrown: number;
    KO_LightBlock: number;
    KO_HeavyBlock: number;
    KO_PlayerGrabbed: number;
    KO_PlayerThrown: number;
}

export interface StatisticPayload {
    uid: string;
    name: string;
    bot: boolean;
    eventName: string;
}

export interface EntititesPayload {
    balls: Array<Balls>;
    cars: Array<{ [key: string]: Cars }>;
}

interface Balls {
    radius: number;
    location: Array<number>;
}

interface Cars {
    uid: string;
    name: string;
    bot: boolean;
    teamIndex: number;
    speed: number;
    location: Array<number>;
    isSuperSonic: boolean;
    isOnWall: boolean;
    isOnGround: boolean;
    isInGoal: boolean;
    isDodging: boolean;
    asFlip: boolean;
    boost: number;
}
