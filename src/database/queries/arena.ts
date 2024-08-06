import db from "../../extensions/database.ts";
import {type Arena, arena} from "../schemas/arena.ts";
import { eq } from "drizzle-orm";

export function getArenas() {
    return db
        .select()
        .from(arena)
        .all() as Arena[];
}

export function getArenaById(id: number) {
    return db
        .select()
        .from(arena)
        .where(eq(arena.id, id))
        .get() as Arena;
}

export function getArenaByCode(code: string) {
    return db
        .select()
        .from(arena)
        .where(eq(arena.code, code))
        .get() as Arena;
}
