import { and, eq } from "drizzle-orm";
import db from "../../extensions/database.ts";
import type { PlayerPayload } from "../../types/plugin.ts";
import { player, type Player } from "../schemas/player.ts";
import { getCarById } from "./car.ts";

export function createOrUpdatePlayer(playerData: PlayerPayload) {
    const playerFound = getPlayerId(playerData);
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
                uid: playerData.id,
                name: playerData.name,
                bot: playerData.bot,
                carId: carExist ? playerData.carId : 23
            })
    }

    return query
        .returning({
            id: player.id,
            uid: player.uid,
            name: player.name,
            bot: player.bot,
            carId: player.carId
        })
        .get() as Player;
}

export function getPlayerById(playerId: number) {
    return db
        .select()
        .from(player)
        .where(eq(player.id, playerId))
        .get() as Player;
}

export function getPlayerId(playerData: PlayerPayload) {
    const condition = () => {
        if (playerData.bot) {
            return and(
                eq(player.uid, playerData.id),
                eq(player.name, playerData.name)
            );
        } else {
            return eq(player.uid, playerData.id);
        }
    }

    return db
        .select({
            id: player.id
        })
        .from(player)
        .where(condition)
        .get() as Player;
}
