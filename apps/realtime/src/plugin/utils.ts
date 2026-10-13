import type { Player, StatisticValues, Versus } from "@rltm/db";
import type { PlayerReference, PlayersPayload, PluginCommand, ScoreboardPlayer } from "@rltm/shared";

// Stat events of the scoreboard saved in the statistic table
const eventColumns = {
    Demolish: "demolish",
    Demolition: "demolition",
    AerialGoal: "aerialGoal",
    BackwardsGoal: "backwardsGoal",
    BicycleGoal: "bicycleGoal",
    LongGoal: "longGoal",
    TurtleGoal: "turtleGoal",
    PoolShot: "poolShot",
    OvertimeGoal: "overtimeGoal",
    HatTrick: "hatTrick",
    Playmaker: "playmaker",
    EpicSave: "epicSave",
    Savior: "savior",
    Center: "center",
    Clear: "clear",
    FirstTouch: "firstTouch",
    BreakoutDamage: "breakoutDamage",
    BreakoutDamageLarge: "breakoutDamageLarge",
    LowFive: "lowFive",
    HighFive: "highFive",
    HoopsSwishGoal: "hoopsSwishGoal",
    BicycleHit: "bicycleHit",
    OwnGoal: "ownGoal",
    KO_Winner: "koWinner",
    KO_Knockout: "koKnockout",
    KO_DoubleKO: "koDoubleKO",
    KO_TripleKO: "koTripleKO",
    KO_Death: "koDeath",
    KO_LightHit: "koLightHit",
    KO_HeavyHit: "koHeavyHit",
    KO_AerialLightHit: "koAerialLightHit",
    KO_AerialHeavyHit: "koAerialHeavyHit",
    KO_HitTaken: "koHitTaken",
    KO_BlockTaken: "koBlockTaken",
    KO_Grabbed: "koGrabbed",
    KO_Thrown: "koThrown",
    KO_LightBlock: "koLightBlock",
    KO_HeavyBlock: "koHeavyBlock",
    KO_PlayerGrabbed: "koPlayerGrabbed",
    KO_PlayerThrown: "koPlayerThrown"
} as const satisfies { [eventName: string]: keyof StatisticValues };

function toCount(value: unknown): number {
    return typeof value === "number" && Number.isFinite(value) ? Math.round(value) : 0;
}

export function getStatisticValues(playerData: ScoreboardPlayer): StatisticValues {
    const values: StatisticValues = {
        teamIndex: toCount(playerData.teamIndex),
        mvp: Boolean(playerData.mvp),
        score: toCount(playerData.score),
        goals: toCount(playerData.goals),
        shots: toCount(playerData.shots),
        assists: toCount(playerData.assists),
        saves: toCount(playerData.saves),
        ballTouches: toCount(playerData.ballTouches),
        carTouches: toCount(playerData.carTouches)
    };

    // Only the events received for the player are sent, a missing event is 0
    for (const [eventName, column] of Object.entries(eventColumns)) {
        values[column] = toCount(playerData.events?.[eventName]);
    }

    return values;
}

export function isSamePlayer(a: Pick<PlayerReference, "uid" | "name" | "bot">, b: Pick<PlayerReference, "uid" | "name">): boolean {
    // Bots share the same uid
    return a.uid === b.uid && (!a.bot || a.name === b.name);
}

export function findPlayer(players: PlayersPayload[] | null, playerData: PlayerReference): PlayersPayload | undefined {
    return players?.find((player) => isSamePlayer(playerData, player));
}

// Number of players of the game team found in the team of the versus
function countPlayers(gamePlayers: PlayersPayload[], teamIndex: number, teamPlayers: unknown): number {
    if (!Array.isArray(teamPlayers)) return 0;

    return gamePlayers
        .filter((player) => player.teamIndex === teamIndex)
        .filter((player) => teamPlayers.some((teamPlayer: Player | number | undefined) =>
            typeof teamPlayer === "object" && teamPlayer !== null && isSamePlayer(player, teamPlayer)
        ))
        .length;
}

// Teams of the versus on the blue (0) and orange (1) sides of the game, from the players of each side
export function getVersusSides(versus: Versus, players: PlayersPayload[] | null): { blue: string, orange: string } | null {
    if (!versus.team1?.name || !versus.team2?.name) return null;

    const gamePlayers = players || [];
    const team1Blue = countPlayers(gamePlayers, 0, versus.team1.players) + countPlayers(gamePlayers, 1, versus.team2.players);
    const team2Blue = countPlayers(gamePlayers, 0, versus.team2.players) + countPlayers(gamePlayers, 1, versus.team1.players);

    return team2Blue > team1Blue
        ? { blue: versus.team2.name, orange: versus.team1.name }
        : { blue: versus.team1.name, orange: versus.team2.name };
}

// Number of the game in the versus, from the games already played
export function getGameNumber(versus: Versus): number {
    const score = (versus as any).score;
    const played = Array.isArray(score) ? toCount(score[0]) + toCount(score[1]) : 0;
    return Math.min(Math.max(played + 1, 1), 99);
}

export function getReplayNameCommand(versus: Versus, players: PlayersPayload[] | null): PluginCommand | null {
    const sides = getVersusSides(versus, players);
    if (!sides) return null;

    const game = getGameNumber(versus);
    return {
        command: "set_replay_name",
        payload: { ...sides, game },
        id: `replay-${versus.id}-${game}`
    };
}
