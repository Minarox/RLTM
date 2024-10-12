import { eq } from "drizzle-orm";
import db from "../../extensions/database.ts";
import { type Team, team } from "../schemas/team.ts";

export function getTeamById(teamId: number) {
    return db
        .select({
            id: team.id,
            seasonId: team.seasonId,
            name: team.name,
            players: team.players,
            logo: team.logo,
            color: team.color
        })
        .from(team)
        .where(eq(team.id, teamId))
        .get() as Team;
}
