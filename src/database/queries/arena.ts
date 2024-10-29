import { eq } from "drizzle-orm";
import db from "../../extensions/database.ts";
import { type Arena, arena } from "../schemas/arena.ts";

export function getArenaByCode(code: string) {
    return db
        .select()
        .from(arena)
        .where(eq(arena.code, code))
        .get() as Arena;
}
