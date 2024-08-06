import db from "../../extensions/database.ts";
import { season } from "../schemas/season.ts";

await db.insert(season).values([
    {
        id: 1,
        tournamentId: 1,
        name: 'Default season',
        description: 'This is the default season.',
        startAt: '20240101',
        endAt: '20241231',
    }
]);

console.log("Seasons seeded successfully.")
