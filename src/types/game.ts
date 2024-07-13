export enum GameTopic {
    MATCH = "match",
    STATISTICS = "statistics",
    STATISTIC = "statistic",
    ENTITIES = "entities"
}

export interface MatchPayload {
    map: string;
    score: Array<number>;
    time: number;
    duration: number;
    isUnlimited: boolean;
    isStarted: boolean;
    isPaused: boolean;
    isOvertime: boolean;
    isEnded: boolean;
    isReplay: boolean;
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
