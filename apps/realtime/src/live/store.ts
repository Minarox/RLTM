import {
    getCurrentMatch,
    getCurrentSeason,
    getCurrentStatistics,
    getResults,
    getSlotById,
    getSlotsByTournamentId,
    getTeamsBySeasonId,
    getTournamentById,
    getTournaments,
    getVersusById,
    type Match,
    type Season,
    type Slot,
    type Statistic,
    type Team,
    type Tournament,
    type Versus
} from "@rltm/db";
import {
    pluginStateTopics,
    slotTopics,
    Topic,
    topicName,
    tournamentTopics,
    type EntitiesPayload,
    type MatchPayload,
    type MatchTeam,
    type PlayersPayload,
    type PluginInfoPayload,
    type ScoreboardPayload,
    type SlotTopic,
    type SpectatorPayload,
    type StatsPayload,
    type TournamentTopic,
    pluginEventTopics
} from "@rltm/shared";
import logger from "../extensions/logger.ts";
import { publish } from "./bus.ts";
import { disconnectPlugin } from "./plugins.ts";

export type LiveMatch = Match & { replay: boolean, teams: MatchTeam[] | null };

// Data shared by all the slots of a tournament
export interface TournamentLive {
    tournament: Tournament;
    season: Season | null;
    teams: Team[] | null;
    results: any;
    slots: Map<string, SlotLive>;
}

// Broadcast slot: its versus, its match and the states of its plugin
export interface SlotLive {
    slot: Slot;
    versus: Versus | null;
    match: LiveMatch | null;
    statistics: Statistic[] | null;
    plugin: PluginInfoPayload | null;
    players: PlayersPayload[] | null;
    scoreboard: ScoreboardPayload | null;
    stats: StatsPayload | null;
    spectator: SpectatorPayload | null;
    entities: EntitiesPayload | null;
    // Last match message of the plugin
    game: MatchPayload | null;
    // WebSocket id of the plugin connected to the slot
    pluginConnectionId: string | null;
}

const tournaments = new Map<string, TournamentLive>();

export function getTournamentLive(tournamentId: string): TournamentLive | undefined {
    return tournaments.get(tournamentId);
}

export function getSlotLive(tournamentId: string, slotId: string): SlotLive | undefined {
    return tournaments.get(tournamentId)?.slots.get(slotId);
}

function changed(before: unknown, after: unknown): boolean {
    return JSON.stringify(before ?? null) !== JSON.stringify(after ?? null);
}

export function publishTournament(tournamentId: string, topic: TournamentTopic, payload: unknown): void {
    publish(topicName.tournament(tournamentId, topic), { [topic]: payload ?? null });
}

export function publishSlot(slotId: string, topic: SlotTopic | typeof pluginEventTopics[number], payload: unknown): void {
    publish(topicName.slot(slotId, topic), { [topic]: payload ?? null });
}

export function setSlotState(slotLive: SlotLive, topic: SlotTopic, payload: unknown): void {
    (slotLive as any)[topic] = payload ?? null;
    publishSlot(slotLive.slot.id, topic, payload);
}

export function clearPluginStates(slotLive: SlotLive): void {
    pluginStateTopics.forEach((topic) => setSlotState(slotLive, topic, null));
    clearEntities(slotLive.slot.id);
}

// Reloads the data of the tournament and publishes the topics that changed. Adds or removes the tournament if needed.
export function refreshTournament(tournamentId: string): TournamentLive | undefined {
    const tournament = getTournamentById(tournamentId);
    if (!tournament?.enabled) {
        removeTournament(tournamentId);
        return undefined;
    }

    const season = getCurrentSeason(tournament.id) || null;
    const data = {
        tournament,
        season,
        teams: season && getTeamsBySeasonId(season.id) || null,
        results: season && getResults(season.id) || null
    };

    let tournamentLive = tournaments.get(tournamentId);
    if (!tournamentLive) {
        tournamentLive = { ...data, slots: new Map() };
        tournaments.set(tournamentId, tournamentLive);
        logger.verbose(`🏬 Load tournament "${tournament.name}" in store`);

        getSlotsByTournamentId(tournamentId).forEach((slot) => refreshSlot(slot.id));
        return tournamentLive;
    }

    tournamentTopics.forEach((topic) => {
        if (changed(tournamentLive[topic], data[topic])) {
            (tournamentLive as any)[topic] = data[topic];
            publishTournament(tournamentId, topic, data[topic]);
        }
    });

    return tournamentLive;
}

function removeTournament(tournamentId: string): void {
    const tournamentLive = tournaments.get(tournamentId);
    if (!tournamentLive) return;

    [...tournamentLive.slots.keys()].forEach((slotId) => removeSlot(tournamentLive, slotId));
    tournaments.delete(tournamentId);
    tournamentTopics.forEach((topic) => publishTournament(tournamentId, topic, null));
    logger.verbose(`🏬 Remove tournament "${tournamentLive.tournament.name}" from store`);
}

function getLiveMatch(slotLive: Pick<SlotLive, "game">, versus: Versus | null): LiveMatch | null {
    const match = versus && getCurrentMatch(versus.id) || null;
    return match && {
        ...match,
        replay: slotLive.game?.isReplay || false,
        teams: slotLive.game?.teams || null
    };
}

// Reloads the match and the statistics of the slot and publishes them if they changed
export function refreshSlotMatch(slotLive: SlotLive): void {
    const match = getLiveMatch(slotLive, slotLive.versus);
    const statistics = match && getCurrentStatistics(match.id) || null;

    if (changed(slotLive.match, match)) setSlotState(slotLive, Topic.MATCH, match);
    if (changed(slotLive.statistics, statistics)) setSlotState(slotLive, Topic.STATISTICS, statistics);
}

// Reloads the slot (versus, match, statistics) and publishes what changed. Adds or removes the slot if needed.
export function refreshSlot(slotId: string): SlotLive | undefined {
    const slot = getSlotById(slotId);
    const tournamentLive = slot && tournaments.get(slot.tournamentId);

    if (!slot?.enabled || !tournamentLive) {
        tournaments.forEach((tournament) => removeSlot(tournament, slotId));
        return undefined;
    }

    const versus = slot.versusId ? getVersusById(slot.versusId) || null : null;

    let slotLive = tournamentLive.slots.get(slotId);
    if (!slotLive) {
        const match = getLiveMatch({ game: null }, versus);
        slotLive = {
            slot,
            versus,
            match,
            statistics: match && getCurrentStatistics(match.id) || null,
            plugin: null,
            players: null,
            scoreboard: null,
            stats: null,
            spectator: null,
            entities: null,
            game: null,
            pluginConnectionId: null
        };
        tournamentLive.slots.set(slotId, slotLive);
        logger.verbose(`🏬 Load slot "${slot.name}" of tournament "${tournamentLive.tournament.name}" in store`);
        return slotLive;
    }

    slotLive.slot = slot;
    if (changed(slotLive.versus, versus)) setSlotState(slotLive, Topic.VERSUS, versus);
    refreshSlotMatch(slotLive);

    return slotLive;
}

function removeSlot(tournamentLive: TournamentLive, slotId: string): void {
    const slotLive = tournamentLive.slots.get(slotId);
    if (!slotLive) return;

    tournamentLive.slots.delete(slotId);
    disconnectPlugin(slotId);
    clearEntities(slotId);
    slotTopics.forEach((topic) => publishSlot(slotId, topic, null));
    logger.verbose(`🏬 Remove slot "${slotLive.slot.name}" from store`);
}

// Loads all the enabled tournaments and their slots, removes the others
export function loadStore(): void {
    const ids = getTournaments().map((tournament) => tournament.id);

    [...tournaments.keys()]
        .filter((tournamentId) => !ids.includes(tournamentId))
        .forEach(removeTournament);

    ids.forEach((tournamentId) => {
        const tournamentLive = refreshTournament(tournamentId);
        if (!tournamentLive) return;

        // refreshSlot removes the slots deleted from the database
        const slotIds = new Set([...tournamentLive.slots.keys(), ...getSlotsByTournamentId(tournamentId).map((slot) => slot.id)]);
        slotIds.forEach((slotId) => refreshSlot(slotId));
    });
}

// Entities are sent every 100 ms by default by the plugin: they are published at most once per interval, with the last payload received
export const entitiesInterval: number = Math.max(0, Number(process.env['ENTITIES_INTERVAL'] ?? 33) || 0);

const entitiesThrottle = new Map<string, { publishedAt: number, timer: ReturnType<typeof setTimeout> | null }>();

function clearEntities(slotId: string): void {
    const throttle = entitiesThrottle.get(slotId);
    if (throttle?.timer) clearTimeout(throttle.timer);
    entitiesThrottle.delete(slotId);
}

export function setEntities(slotLive: SlotLive, entities: EntitiesPayload | null): void {
    const slotId = slotLive.slot.id;
    slotLive.entities = entities;

    if (!entities) {
        clearEntities(slotId);
        publishSlot(slotId, Topic.ENTITIES, null);
        return;
    }

    const throttle = entitiesThrottle.get(slotId) || { publishedAt: 0, timer: null };
    entitiesThrottle.set(slotId, throttle);
    if (throttle.timer) return;

    const wait = throttle.publishedAt + entitiesInterval - Date.now();
    const send = (): void => {
        throttle.timer = null;
        throttle.publishedAt = Date.now();
        publishSlot(slotId, Topic.ENTITIES, slotLive.entities);
    };

    if (wait <= 0) send();
    else throttle.timer = setTimeout(send, wait);
}
