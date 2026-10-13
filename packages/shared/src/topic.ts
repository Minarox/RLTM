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
