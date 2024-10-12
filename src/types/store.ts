import type { Season } from "../database/schemas/season";
import type { Tournament } from "../database/schemas/tournament";
import type { Versus } from "../database/schemas/versus";
import type { MatchPayload, PlayersPayload, StatisticsPayload } from "./plugin";

export interface Store {
    tournament: Tournament,
    season: Season | null,
    versus: Versus | null,
    match: MatchPayload | null,
    players: PlayersPayload[] | null
    statistics: StatisticsPayload[] | null
    plugin: string | null
}
