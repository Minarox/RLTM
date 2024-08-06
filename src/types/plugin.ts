export enum GameTopic {
    MATCH = "match",
    STATISTICS = "statistics",
    STATISTIC = "statistic",
    ENTITIES = "entities"
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

export interface StatisticsPayload {
    name: string;
    uid: string;
    score: number;
    goals: number;
    ownGoals: number;
    shots: number;
    assists: number;
    saves: number;
    ballTouches: number;
    carTouches: number;
    demolishes: number;
    mvp: boolean;
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
