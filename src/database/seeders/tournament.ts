import db from "../../extensions/database.ts";
import { tournament } from "../schemas/tournament.ts";

await db.insert(tournament).values([
    {
        id: 1,
        name: 'Default tournament',
        description: 'This is the default tournament.'
    }
]);

console.log("Tournaments seeded successfully.")
