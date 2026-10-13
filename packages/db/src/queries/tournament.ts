import { eq } from "drizzle-orm";
import db from "../client.ts";
import { type Tournament, tournament } from "../schemas/tournament.ts";

const select = {
    id: tournament.id,
    name: tournament.name,
    description: tournament.description,
    logo: tournament.logo,
    color: tournament.color,
    enabled: tournament.enabled
}

export function getTournaments(): Tournament[] {
    return db
        .select(select)
        .from(tournament)
        .all() as Tournament[];
}

export function checkTournamentById(id: string): boolean {
    return Boolean(
        db
            .select({id: tournament.id})
            .from(tournament)
            .where(eq(tournament.id, id))
            .get() as Tournament
    );
}

export function getTournamentByToken(token: string): Tournament {
    return db
        .select({id: tournament.id})
        .from(tournament)
        .where(eq(tournament.token, token))
        .get() as Tournament;
}
