import { eq } from "drizzle-orm";
import db from "../client.ts";
import { type Team, team } from "../schemas/team.ts";
import { resolveTeamPlayers } from "./player.ts";

const select = {
    id: team.id,
    seasonId: team.seasonId,
    name: team.name,
    players: team.players,
    logo: team.logo,
    color: team.color
}

export function getTeamsBySeasonId(seasonId: number): Team[] {
    const teamData = db
        .select(select)
        .from(team)
        .where(eq(team.seasonId, seasonId))
        .all() as Team[];

    resolveTeamPlayers(teamData);
    return teamData;
}

export function getTeamsIdsBySeasonId(seasonId: number): Team[] {
    return db
        .select({
            id: team.id
        })
        .from(team)
        .where(eq(team.seasonId, seasonId))
        .all() as Team[];
}
