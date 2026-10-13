import type { Match } from "../database/schemas/match";
import type { Season } from "../database/schemas/season";
import type { Statistic } from "../database/schemas/statistic";
import type { Team } from "../database/schemas/team";
import type { Tournament } from "../database/schemas/tournament";
import type { Versus } from "../database/schemas/versus";
import type {
    EntitiesPayload,
    PlayersPayload,
    PluginInfoPayload,
    ScoreboardPayload,
    SpectatorPayload,
    StatsPayload
} from "./plugin";

export enum Topic {
    TOURNAMENT = "tournament",
    SEASON = "season",
    TEAMS = 'teams',
    RESULTS = 'results',
    VERSUS = "versus",
    MATCH = "match",
    STATISTICS = "statistics",

    // Topics of the plugin, published as received
    PLUGIN = "plugin",
    PLAYERS = "players",
    SCOREBOARD = "scoreboard",
    STATS = "stats",
    SPECTATOR = "spectator",
    ENTITIES = "entities",
    STATISTIC = "statistic",
    EVENT = "event",
    RESULT = "result"
}

// States of the plugin kept in the store, cleared when the plugin disconnects
export const pluginStateTopics = [Topic.PLUGIN, Topic.PLAYERS, Topic.SCOREBOARD, Topic.STATS, Topic.SPECTATOR, Topic.ENTITIES];

// One-shot messages of the plugin, only published
export const pluginEventTopics = [Topic.STATISTIC, Topic.EVENT, Topic.RESULT];

export interface Store {
    tournament: Tournament,
    season: Season | null,
    teams: Team[] | null,
    results: any
    versus: Versus | null,
    match: Match | null,
    statistics: Statistic[] | null
    plugin: PluginInfoPayload | null
    players: PlayersPayload[] | null
    scoreboard: ScoreboardPayload | null
    stats: StatsPayload | null
    spectator: SpectatorPayload | null
    entities: EntitiesPayload | null
    // WebSocket id of the plugin connected to the tournament
    connection: string | null
}
