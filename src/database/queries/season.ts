import db from "../../extensions/database.ts";
import {and, eq, gte, lte} from "drizzle-orm";
import { type Season, season } from "../schemas/season.ts";

export function getCurrentSeason(tournamentId: number) {
    const currentDate: string = new Date().toISOString().split('T')[0].split('-').join('');


    return db
        .select()
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
