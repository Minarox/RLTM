import db from "../client.ts";
import { season } from "../schemas/season.ts";

await db.insert(season).values([
    {
        id: 1,
        tournamentId: 'DEFAULT',
        name: 'Default season',
        description: 'This is the default season.',
        startAt: '2024-01-01',
        endAt: '2024-12-31',
    }
]);

console.log("Season table seeded successfully.")
