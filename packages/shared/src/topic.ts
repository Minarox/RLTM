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
export const pluginStateTopics = [Topic.PLUGIN, Topic.PLAYERS, Topic.SCOREBOARD, Topic.STATS, Topic.SPECTATOR, Topic.ENTITIES] as const;

// One-shot messages of the plugin, only published
export const pluginEventTopics = [Topic.STATISTIC, Topic.EVENT, Topic.RESULT] as const;

// Topics of the tournament, shared by all its slots
export const tournamentTopics = [Topic.TOURNAMENT, Topic.SEASON, Topic.TEAMS, Topic.RESULTS] as const;
export type TournamentTopic = typeof tournamentTopics[number];

// States of a slot: its versus and match, and the states of its plugin
export const slotTopics = [Topic.VERSUS, Topic.MATCH, Topic.STATISTICS, ...pluginStateTopics] as const;
export type SlotTopic = typeof slotTopics[number];

// Names of the pub/sub topics, only built here
export const topicName = {
    tournament: (tournamentId: string, topic: TournamentTopic): string => `t:${tournamentId}:${topic}`,
    slot: (slotId: string, topic: SlotTopic | typeof pluginEventTopics[number]): string => `s:${slotId}:${topic}`
};
