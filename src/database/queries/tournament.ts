import { eq } from "drizzle-orm";
import db from "../../extensions/database.ts";
import { type Tournament, tournament } from "../schemas/tournament.ts";

const select = {
    id: tournament.id,
    name: tournament.name,
    description: tournament.description,
    logo: tournament.logo,
    enabled: tournament.enabled
}

export function getTournaments() {
    return db
        .select(select)
        .from(tournament)
        .all() as Tournament[];
}

export function getTournamentById(id: string) {
    return db
        .select(select)
        .from(tournament)
        .where(eq(tournament.id, id))
        .get() as Tournament;
}


export function getTournamentByToken(token: string) {
    return db
        .select()
        .from(tournament)
        .where(eq(tournament.token, token))
        .get() as Tournament;
}
