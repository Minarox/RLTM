import db from "../../extensions/database.ts";
import { season } from "../schemas/season.ts";

await db.insert(season).values([
    {
        id: 1,
        tournamentId: 'DEFAULT',
        name: 'Default season',
        description: 'This is the default season.',
        startAt: '20240101',
        endAt: '20241231',
    }
]);

console.log("Season table seeded successfully.")
