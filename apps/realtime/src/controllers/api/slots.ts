import {
    createSlot,
    deleteSlot,
    getSlotOfTournament,
    getSlotOfVersus,
    getSlotsByTournamentId,
    getTournamentById,
    isVersusOfTournament,
    regenerateSlotToken,
    updateSlot,
    type Slot
} from "@rltm/db";
import { Elysia, t } from "elysia";
import { authorizeAdmin } from "../../auth.ts";
import { disconnectPlugin } from "../../live/plugins.ts";
import { getSlotLive, refreshSlot } from "../../live/store.ts";

const tournamentParams = t.Object({
    tournamentId: t.String()
});

const slotParams = t.Object({
    tournamentId: t.String(),
    slotId: t.String()
});

const slotName = t.String({ minLength: 1, maxLength: 64 });
const slotVersus = t.Nullable(t.Integer({ minimum: 1 }));

export const createSlotBody = t.Object({
    name: slotName,
    versusId: t.Optional(slotVersus),
    enabled: t.Optional(t.Boolean())
});

export const updateSlotBody = t.Object({
    name: t.Optional(slotName),
    versusId: t.Optional(slotVersus),
    enabled: t.Optional(t.Boolean())
});

// Error of the versus to assign to a slot, if any
function checkVersus(tournamentId: string, versusId: number | null | undefined, slotId?: string): string | undefined {
    if (!versusId) return undefined;
    if (!isVersusOfTournament(versusId, tournamentId)) return "VERSUS_NOT_IN_TOURNAMENT";

    // Two slots of a versus would save their matches in it, and show the matches of each other
    if (getSlotOfVersus(versusId, slotId)) return "VERSUS_ALREADY_ASSIGNED";
    return undefined;
}

// Slot with the state of its plugin
function toResponse(slot: Slot) {
    return {
        ...slot,
        connected: Boolean(getSlotLive(slot.tournamentId, slot.id)?.pluginConnectionId)
    };
}

export default new Elysia({
    name: "Slots API",
    prefix: "/api/tournaments/:tournamentId/slots"
})
    .guard({
        beforeHandle: [
            authorizeAdmin,
            ({ params, status }) => {
                if (!getTournamentById((params as { tournamentId: string }).tournamentId)) {
                    return status(404, "TOURNAMENT_NOT_FOUND");
                }
            }
        ]
    })

    .get("", ({ params }) => getSlotsByTournamentId(params.tournamentId).map(toResponse), { params: tournamentParams })

    .post("", ({ params, body, status }) => {
        const versusError = checkVersus(params.tournamentId, body.versusId);
        if (versusError) return status(422, versusError);

        const slot = createSlot(params.tournamentId, body);
        refreshSlot(slot.id);
        return status(201, toResponse(slot));
    }, { params: tournamentParams, body: createSlotBody })

    .patch("/:slotId", ({ params, body, status }) => {
        if (!getSlotOfTournament(params.tournamentId, params.slotId)) return status(404, "SLOT_NOT_FOUND");
        const versusError = checkVersus(params.tournamentId, body.versusId, params.slotId);
        if (versusError) return status(422, versusError);

        const slot = updateSlot(params.slotId, body)!;
        refreshSlot(slot.id);
        return toResponse(slot);
    }, { params: slotParams, body: updateSlotBody })

    .post("/:slotId/regenerate-token", ({ params, status }) => {
        if (!getSlotOfTournament(params.tournamentId, params.slotId)) return status(404, "SLOT_NOT_FOUND");

        // The plugin connected with the previous token is disconnected
        const slot = regenerateSlotToken(params.slotId)!;
        disconnectPlugin(slot.id);
        refreshSlot(slot.id);
        return toResponse(slot);
    }, { params: slotParams })

    .delete("/:slotId", ({ params, status }) => {
        if (!getSlotOfTournament(params.tournamentId, params.slotId)) return status(404, "SLOT_NOT_FOUND");

        deleteSlot(params.slotId);
        refreshSlot(params.slotId);
        return status(204, undefined);
    }, { params: slotParams });
