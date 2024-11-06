import type { Season } from "../database/schemas/season";
import type { Team } from "../database/schemas/team";
import type { Tournament } from "../database/schemas/tournament";
import type { Versus } from "../database/schemas/versus";
import type { MatchPayload, PlayersPayload, StatisticsPayload } from "./plugin";

export enum Topic {
    TOURNAMENT = "tournament",
    SEASON = "season",
    TEAMS = 'teams',
    RESULTS = 'results',
    VERSUS = "versus",
    MATCH = "match",
    PLAYERS = "players",
    STATISTICS = "statistics",
    STATISTIC = "statistic",
    ENTITIES = "entities",
    PLUGIN = "plugin"
}

export interface Store {
    tournament: Tournament,
    season: Season | null,
    teams: Team[] | null,
    results: any
    versus: Versus | null,
    match: MatchPayload | null,
    players: PlayersPayload[] | null
    statistics: StatisticsPayload[] | null
    plugin: string | null
}
