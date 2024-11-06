import { and, eq } from "drizzle-orm";
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

export function checkTournament(id: string, token?: string): boolean {
    let where: any;
    if (token) {
        where = and(
            eq(tournament.id, id),
            eq(tournament.token, token)
        );
    } else {
        where = eq(tournament.id, id);
    }

    return Boolean(
        db
            .select(select)
            .from(tournament)
            .where(where)
            .get() as Tournament
    );
}
