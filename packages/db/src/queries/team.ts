import { eq } from "drizzle-orm";
import db from "../client.ts";
import { type Team, team } from "../schemas/team.ts";
import { getCarById } from "./car.ts";
import { getPlayerById } from "./player.ts";

const select = {
    id: team.id,
    seasonId: team.seasonId,
    name: team.name,
    players: team.players,
    logo: team.logo,
    color: team.color
}

function addPlayersToTeam(teamData: Team): void {
    if (teamData.players) {
        teamData.players = (teamData.players as any[])
            .map((player) => {
                if (typeof player === 'number') {
                    const playerData = getPlayerById(player);

                    if (playerData) {
                        playerData.car = getCarById(playerData.carId);
                    }
                    return playerData;
                }
                return player;
            })
    }
}

export function getTeamsBySeasonId(seasonId: number): Team[] {
    const teamData = db
        .select(select)
        .from(team)
        .where(eq(team.seasonId, seasonId))
        .all() as Team[];

    teamData.forEach(addPlayersToTeam);
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
