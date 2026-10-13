import db from "../client.ts";
import { slot } from "../schemas/slot.ts";

await db.insert(slot).values([
    {
        id: 'DEFAULT',
        tournamentId: 'DEFAULT',
        name: 'Default'
    }
]);

console.log("Slots seeded successfully.")
