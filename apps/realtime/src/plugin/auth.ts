import { getSlotByToken } from "@rltm/db";
import { getSlotLive, type SlotLive } from "../live/store.ts";

// Token of the slot sent by the plugin: ?token= in the URL, or Authorization: Bearer <token>
export function getPluginToken(data: { query?: unknown, headers?: unknown }): string | undefined {
    const query = (data?.query as Record<string, unknown> | undefined)?.['token'];
    if (typeof query === "string" && query) return query;

    const authorization = (data?.headers as Record<string, unknown> | undefined)?.['authorization'];
    if (typeof authorization === "string" && authorization.startsWith("Bearer ")) {
        return authorization.slice("Bearer ".length).trim() || undefined;
    }

    return undefined;
}

// Slot of the token of the plugin, if it is enabled and in the store
export function getSlotOfPlugin(data: { query?: unknown, headers?: unknown }): SlotLive | undefined {
    const token = getPluginToken(data);
    const slot = token ? getSlotByToken(token) : undefined;
    return slot?.enabled ? getSlotLive(slot.tournamentId, slot.id) : undefined;
}
