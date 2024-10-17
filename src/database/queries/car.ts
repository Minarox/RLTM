import db from "../../extensions/database.ts";
import {type Car, car} from "../schemas/car.ts";
import { eq } from "drizzle-orm";

export function getCarById(id: number) {
    return db
        .select()
        .from(car)
        .where(eq(car.id, id))
        .get() as Car;
}
