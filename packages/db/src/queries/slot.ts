import { and, eq, sql } from "drizzle-orm";
import db from "../client.ts";
import { log } from "../logger.ts";
import { type Slot, slot } from "../schemas/slot.ts";

export type SlotValues = Partial<Pick<Slot, "name" | "versusId" | "enabled">>;

export function getSlotsByTournamentId(tournamentId: string): Slot[] {
    return db
        .select()
        .from(slot)
        .where(eq(slot.tournamentId, tournamentId))
        .orderBy(slot.createdAt)
        .all() as Slot[];
}

export function getSlotById(slotId: string): Slot | undefined {
    return db
        .select()
        .from(slot)
        .where(eq(slot.id, slotId))
        .get() as Slot | undefined;
}

export function getSlotOfTournament(tournamentId: string, slotId: string): Slot | undefined {
    return db
        .select()
        .from(slot)
        .where(and(eq(slot.id, slotId), eq(slot.tournamentId, tournamentId)))
        .get() as Slot | undefined;
}

export function getSlotByToken(token: string): Slot | undefined {
    return db
        .select()
        .from(slot)
        .where(eq(slot.token, token))
        .get() as Slot | undefined;
}

export function createSlot(tournamentId: string, values: SlotValues & { name: string }): Slot {
    const query = db
        .insert(slot)
        .values({ ...values, tournamentId })
        .returning()
        .get() as Slot;

    log.debug(`Create slot ${query.id} (${query.name}) for tournament ${tournamentId}`);
    return query;
}

export function updateSlot(slotId: string, values: SlotValues): Slot | undefined {
    const query = db
        .update(slot)
        .set(values)
        .where(eq(slot.id, slotId))
        .returning()
        .get() as Slot | undefined;

    log.debug(`Update slot ${slotId}`);
    return query;
}

export function regenerateSlotToken(slotId: string): Slot | undefined {
    const query = db
        .update(slot)
        .set({ token: sql`(hex(randomblob(38)))` })
        .where(eq(slot.id, slotId))
        .returning()
        .get() as Slot | undefined;

    log.debug(`Regenerate the token of slot ${slotId}`);
    return query;
}

export function deleteSlot(slotId: string): boolean {
    const query = db
        .delete(slot)
        .where(eq(slot.id, slotId))
        .returning({ id: slot.id })
        .get();

    log.debug(`Delete slot ${slotId}`);
    return Boolean(query);
}
