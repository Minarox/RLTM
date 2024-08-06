import db from "../../extensions/database.ts";
import {type Tournament, tournament} from "../schemas/tournament.ts";
import { eq } from "drizzle-orm";

export function getTournaments() {
    return db
        .select()
        .from(tournament)
        .all() as Tournament[];
}

export function getTournamentByToken(token: string) {
    return db
        .select()
        .from(tournament)
        .where(eq(tournament.token, token))
        .get() as Tournament;
}
