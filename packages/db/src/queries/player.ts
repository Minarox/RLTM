import { and, eq, inArray } from "drizzle-orm";
import db from "../client.ts";
import { log } from "../logger.ts";
import type { PlayerReference } from "@rltm/shared";
import { car } from "../schemas/car.ts";
import { player, type Player } from "../schemas/player.ts";
import { getCarById } from "./car.ts";

const select = {
    id: player.id,
    uid: player.uid,
    name: player.name,
    bot: player.bot,
    carId: player.carId
}

// carId is only known from the players topic, the car of the player is kept without it
export function createOrUpdatePlayer(playerData: PlayerReference & { carId?: number | undefined }): Player {
    const playerFound = getPlayer(playerData);
    const carExist = playerData.carId !== undefined && !!getCarById(playerData.carId);

    let query;
    if (playerFound) {
        const values: any = {
            name: playerData.name
        }

        if (playerData.carId !== undefined && [0, 1].includes(playerData.teamIndex)) {
            values.carId = carExist ? playerData.carId : 23;
        }

        query = db
            .update(player)
            .set(values)
            .where(eq(player.id, playerFound.id))
            .returning(select)
            .get() as Player;

        log.debug(`Update ${query.bot ? 'bot' : 'player'} ${query.id} (${query.name})`);
    } else {
        query = db
            .insert(player)
            .values({
                uid: playerData.uid,
                name: playerData.name,
                bot: playerData.bot,
                carId: carExist ? playerData.carId! : 23
            })
            .returning(select)
            .get() as Player;

        log.debug(`Create new ${query.bot ? 'bot' : 'player'} ${query.id} (${query.name})`);
    }

    return query;
}

export function getPlayerById(playerId: number): Player {
    return db
        .select({
            ...select,
            car: car
        })
        .from(player)
        .leftJoin(car, eq(player.carId, car.id))
        .where(eq(player.id, playerId))
        .get() as Player;
}

export function getPlayer(playerData: Pick<PlayerReference, "uid" | "name" | "bot">): Player {
    const condition = () => {
        if (playerData.bot) {
            return and(
                eq(player.uid, playerData.uid),
                eq(player.name, playerData.name)
            );
        } else {
            return eq(player.uid, playerData.uid);
        }
    }

    return db
        .select(select)
        .from(player)
        .where(condition)
        .get() as Player;
}

// Players of the teams, with their car, in one query: the teams store the ids of their players
export function resolveTeamPlayers(teams: Array<{ players: unknown } | null | undefined>): void {
    const ids = [...new Set(teams.flatMap((teamData) => Array.isArray(teamData?.players) ? teamData.players : [])
        .filter((playerId): playerId is number => typeof playerId === "number"))];
    if (!ids.length) return;

    const players = new Map(
        (db
            .select({
                ...select,
                car: car
            })
            .from(player)
            .leftJoin(car, eq(player.carId, car.id))
            .where(inArray(player.id, ids))
            .all() as Player[])
            .map((playerData) => [playerData.id, playerData])
    );

    teams.forEach((teamData) => {
        if (teamData && Array.isArray(teamData.players)) {
            teamData.players = teamData.players.map((playerId) => typeof playerId === "number" ? players.get(playerId) : playerId);
        }
    });
}
