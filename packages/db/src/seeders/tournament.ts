import db from "../client.ts";
import { tournament } from "../schemas/tournament.ts";

await db.insert(tournament).values([
    {
        id: 'DEFAULT',
        name: 'Default tournament',
        description: 'This is the default tournament.'
    }
]);

console.log("Tournaments seeded successfully.")
