import { and, eq } from "drizzle-orm";
import db from "../../extensions/database.ts";
import type { PlayersPayload } from "../../types/plugin.ts";
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

export function createOrUpdatePlayer(playerData: PlayersPayload) {
    const playerFound = getPlayer(playerData);
    const carExist = !!getCarById(playerData.carId);

    let query;
    if (playerFound) {
        const values: any = {
            name: playerData.name
        }

        if ([0, 1].includes(playerData.teamIndex)) {
            values.carId = carExist ? playerData.carId : 23;
        }

        query = db
            .update(player)
            .set(values)
            .where(eq(player.id, playerFound.id));
    } else {
        query = db
            .insert(player)
            .values({
                uid: playerData.uid,
                name: playerData.name,
                bot: playerData.bot,
                carId: carExist ? playerData.carId : 23
            })
    }

    return query
        .returning(select)
        .get() as Player;
}

export function getPlayerById(playerId: number) {
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

export function getPlayer(playerData: PlayersPayload) {
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
