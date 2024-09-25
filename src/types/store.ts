import type { Game } from "../database/schemas/game";
import type { Season } from "../database/schemas/season";
import type { Tournament } from "../database/schemas/tournament";
import type { MatchPayload, StatisticsPayload } from "./plugin";

export interface Store {
    tournament: Tournament,
    season: Season | null,
    game: Game | null,
    match: MatchPayload | null,
    statistics: StatisticsPayload | null
    plugin: string | null
}
