import { eq } from "drizzle-orm";
import db from "../../extensions/database.ts";
import { type Team, team } from "../schemas/team.ts";

export function getTeamById(teamId: number) {
    return db
        .select()
        .from(team)
        .where(eq(team.id, teamId))
        .get() as Team;
}
