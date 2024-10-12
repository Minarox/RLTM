export enum GameTopic {
    MATCH = "match",
    STATISTICS = "statistics",
    STATISTIC = "statistic",
    ENTITIES = "entities",
    PLAYERS = "players"
}

export interface MatchPayload {
    duration: number;
    id: string;
    isEnded: boolean;
    isOvertime: boolean;
    isPaused: boolean;
    isReplay: boolean;
    isStarted: boolean;
    isUnlimited: boolean;
    map: string;
    score: Array<number>;
    time: number;
}

export interface PlayerPayload {
    name: string;
    id: string;
    carId: number;
    bot: boolean;
}

export interface StatisticsPayload {
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
    name: string;
    uid: string;
    eventName: string;
}

export interface EntititesPayload {
    balls: Array<Balls>;
    cars: Array<{ [key: string]: Cars }>;
}

interface Balls {
    location: Array<number>;
}

interface Cars {
    asFlip: boolean;
    boost: number;
    isDodging: boolean;
    isInGoal: boolean;
    isOnGround: boolean;
    isOnWall: boolean;
    isSuperSonic: boolean;
    location: Array<number>;
    speed: number;
}
