import db from "../extensions/drizzle.ts";
import { tournament } from "../schemas/tournament.ts";

await db().insert(tournament).values([
    {
        name: 'Default tournament'
    }
]);

console.log("Tournaments seeded successfully.")
