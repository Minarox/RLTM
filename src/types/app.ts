import type { Season } from "../database/schemas/season";
import type { Tournament } from "../database/schemas/tournament";
import type { Versus } from "../database/schemas/versus";
import type { MatchPayload, PlayersPayload, StatisticsPayload } from "./plugin";

export enum Topic {
    TOURNAMENT = "tournament",
    SEASON = "season",
    VERSUS = "versus",
    MATCH = "match",
    PLAYERS = "players",
    STATISTICS = "statistics",
    STATISTIC = "statistic",
    ENTITIES = "entities",
    SCOREBOARD = "scoreboard",
    PLUGIN = "plugin"
}

export interface Store {
    tournament: Tournament,
    season: Season | null,
    versus: Versus | null,
    match: MatchPayload | null,
    players: PlayersPayload[] | null
    statistics: StatisticsPayload[] | null
    scoreboard: null
    plugin: string | null
}
