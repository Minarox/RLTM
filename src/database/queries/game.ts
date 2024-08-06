import db from "../../extensions/database.ts";
import {type Game, game} from "../schemas/game.ts";
import { eq } from "drizzle-orm";

export function getGameById(id: number) {
    return db
        .select()
        .from(game)
        .where(eq(game.id, id))
        .get() as Game;
}
