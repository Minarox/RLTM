import { and, eq, gte, lte } from "drizzle-orm";
import db from "../../extensions/database.ts";
import { type Season, season } from "../schemas/season.ts";

const select = {
    id: season.id,
    tournamentId: season.tournamentId,
    name: season.name,
    description: season.description,
    teamLength: season.teamLength,
    defaultMatchLength: season.defaultMatchLength,
    startAt: season.startAt,
    endAt: season.endAt
}

export function getCurrentSeason(tournamentId: string) {
    const currentDate: string = new Date().toISOString().split('T')[0];

    return db
        .select(select)
        .from(season)
        .where(
            and(
                eq(season.tournamentId, tournamentId),
                lte(season.startAt, currentDate),
                gte(season.endAt, currentDate)
            )
        )
        .get() as Season;
}
