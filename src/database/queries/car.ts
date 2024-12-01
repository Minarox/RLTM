import { eq } from "drizzle-orm";
import db from "../../extensions/database.ts";
import { type Car, car } from "../schemas/car.ts";

export function getCarById(id: number): Car {
    return db
        .select()
        .from(car)
        .where(eq(car.id, id))
        .get() as Car;
}
