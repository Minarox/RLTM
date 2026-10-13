import {
    getCurrentMatch,
    getCurrentSeason,
    getCurrentStatistics,
    getCurrentVersus,
    getResults,
    getTeamsBySeasonId,
    getTournaments,
    type Match,
    type Season,
    type Statistic,
    type Team,
    type Tournament,
    type Versus
} from "@rltm/db";
import {
    pluginStateTopics,
    Topic,
    type EntitiesPayload,
    type PlayersPayload,
    type PluginInfoPayload,
    type ScoreboardPayload,
    type SpectatorPayload,
    type StatsPayload
} from "@rltm/shared";
import logger from "../extensions/logger.ts";
import { publish } from "./bus.ts";

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

// Live data of each enabled tournament
export const store: { [tournamentId: string]: Store } = {};

export function publishTopic(tournamentId: string, topic: string, payload: unknown): void {
    publish(`${tournamentId}_${topic}`, { [topic]: payload });
}

export function setState(tournamentId: string, topic: Topic, payload: unknown): void {
    (store[tournamentId] as any)[topic] = payload;
    publishTopic(tournamentId, topic, payload);
}

export function loadStore(): void {
    getTournaments()
        .forEach((tournament: Tournament): void => {
            if (!tournament.enabled) return;

            const oldData = store[tournament.id] ? Object.assign({}, store[tournament.id]) : null;
            const season = getCurrentSeason(tournament.id) || null;
            const teams = season && getTeamsBySeasonId(season.id) || null;
            const results = season && getResults(season.id) || null;
            const versus = season && getCurrentVersus(season.id) || null;
            const match = versus && getCurrentMatch(versus.id) || null;
            const statistics = match && getCurrentStatistics(match.id) || null;

            store[tournament.id] = {
                [Topic.TOURNAMENT]: tournament,
                [Topic.SEASON]: season,
                [Topic.TEAMS]: teams,
                [Topic.RESULTS]: results,
                [Topic.VERSUS]: versus,
                [Topic.MATCH]: match,
                [Topic.STATISTICS]: statistics,
                // States received from the plugin
                ...Object.fromEntries(pluginStateTopics.map((topic) => [topic, oldData ? (oldData as any)[topic] : null])),
                connection: oldData ? oldData.connection : null
            } as Store;

            logger.verbose(`🏬 ${oldData ? 'Update' : 'Load'} tournament "${tournament.name}" in store`);

            if (oldData) {
                Object.keys(oldData)
                    .forEach((key) => {
                        if (JSON.stringify((oldData as any)[key]) !== (store[tournament.id] as any)[key]) {
                            publishTopic(tournament.id, key, (store[tournament.id] as any)[key] || null);
                        }
                    })
            }
        });
}
