import type { Season } from "../database/schemas/season";
import type { Team } from "../database/schemas/team";
import type { Tournament } from "../database/schemas/tournament";
import type { Versus } from "../database/schemas/versus";
import type { MatchPayload, PlayersPayload, StatisticsPayload } from "./plugin";

export enum Topic {
    TOURNAMENT = "tournament",
    SEASON = "season",
    TEAMS = 'teams',
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
    teams: Team[] | null,
    versus: Versus | null,
    match: MatchPayload | null,
    players: PlayersPayload[] | null
    statistics: StatisticsPayload[] | null
    scoreboard: any
    plugin: string | null
}
