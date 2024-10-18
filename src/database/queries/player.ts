import { and, eq } from "drizzle-orm";
import db from "../../extensions/database.ts";
import type { PlayerPayload } from "../../types/plugin.ts";
import { player, type Player } from "../schemas/player.ts";
import { getCarById } from "./car.ts";

const select = {
    id: player.id,
    uid: player.uid,
    name: player.name,
    bot: player.bot,
    carId: player.carId
}

export function createOrUpdatePlayer(playerData: PlayerPayload) {
    const playerFound = getPlayer(playerData);
    const carExist = !!getCarById(playerData.carId);

    let query;
    if (playerFound) {
        query = db
            .update(player)
            .set({
                name: playerData.name,
                carId: carExist ? playerData.carId : 23
            })
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
        .select(select)
        .from(player)
        .where(eq(player.id, playerId))
        .get() as Player;
}

export function getPlayer(playerData: PlayerPayload) {
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
