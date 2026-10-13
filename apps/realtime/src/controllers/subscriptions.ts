import { pluginEventTopics, topicName, type SlotTopic, type TournamentTopic } from "@rltm/shared";
import { getSlotLive, getTournamentLive } from "../live/store.ts";

export interface Subscriptions {
    tournament?: readonly TournamentTopic[];
    slot?: readonly SlotTopic[];
    // One-shot messages of the plugin of the slot (statistic, event, result)
    events?: boolean;
}

function getTopicNames(params: { tournamentId: string, slotId?: string }, subscriptions: Subscriptions): string[] {
    const { tournamentId, slotId } = params;
    return [
        ...(subscriptions.tournament || []).map((topic) => topicName.tournament(tournamentId, topic)),
        ...(slotId ? (subscriptions.slot || []).map((topic) => topicName.slot(slotId, topic)) : []),
        ...(slotId && subscriptions.events ? pluginEventTopics.map((topic) => topicName.slot(slotId, topic)) : [])
    ];
}

// WebSocket of an overlay: subscribes to the topics of the tournament and of the slot, and sends their current values
export function overlaySocket(subscriptions: Subscriptions) {
    return {
        open(ws: any): void {
            const params = ws.data.params as { tournamentId: string, slotId?: string };
            const tournamentLive = getTournamentLive(params.tournamentId);
            const slotLive = params.slotId ? getSlotLive(params.tournamentId, params.slotId) : undefined;

            getTopicNames(params, subscriptions).forEach((name) => ws.subscribe(name));

            (subscriptions.tournament || []).forEach((topic) => {
                ws.send(JSON.stringify({ [topic]: tournamentLive?.[topic] ?? null }));
            });
            (subscriptions.slot || []).forEach((topic) => {
                ws.send(JSON.stringify({ [topic]: slotLive?.[topic] ?? null }));
            });
        },

        close(ws: any): void {
            getTopicNames(ws.data.params, subscriptions).forEach((name) => ws.unsubscribe(name));
        }
    };
}
