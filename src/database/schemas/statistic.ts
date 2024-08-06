import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { game } from "./game.ts";
import { player } from "./player.ts";

export interface Statistic {
    id: number;
    gameId: number;
    playerId: number;
    mvp: number;
    score: number;
    goals: number;
    shots: number;
    assists: number;
    saves: number;
    ballTouches: number;
    carTouches: number;
    demolish: number;
    demolition: number;
    aerialGoal: number;
    backwardsGoal: number;
    bicycleGoal: number;
    longGoal: number;
    turtleGoal: number;
    poolShot: number;
    overtimeGoal: number;
    hatTrick: number;
    playmaker: number;
    epicSave: number;
    savior: number;
    center: number;
    clear: number;
    firstTouch: number;
    breakoutDamage: number;
    breakoutDamageLarge: number;
    lowFive: number;
    highFive: number;
    hoopsSwishGoal: number;
    bicycleHit: number;
    onGoal: number;
    koWinner: number;
    koKnockout: number;
    koDoubleKO: number;
    koTripleKO: number;
    koDeath: number;
    koLightHit: number;
    koHeavyHit: number;
    koAerialLightHit: number;
    koAerialHeavyHit: number;
    koHitTaken: number;
    koBlockTaken: number;
    koGrabbed: number;
    koThrown: number;
    koLightBlock: number;
    koHeavyBlock: number;
    koPlayerGrabbed: number;
    koPlayerThrown: number;
    createdAt: string;
}

export const statistic = sqliteTable("statistic", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    gameId: integer("game_id").references(() => game.id),
    playerId: integer("player_id").references(() => player.id),
    mvp: integer("mvp").notNull().default(0),
    score: integer("score").notNull().default(0),
    goals: integer("goals").notNull().default(0),
    shots: integer("shots").notNull().default(0),
    assists: integer("assists").notNull().default(0),
    saves: integer("saves").notNull().default(0),
    ballTouches: integer("ball_touches").notNull().default(0),
    carTouches: integer("car_touches").notNull().default(0),
    demolish: integer("demolish").notNull().default(0),
    demolition: integer("demolition").notNull().default(0),
    aerialGoal: integer("aerial_goal").notNull().default(0),
    backwardsGoal: integer("backwards_goal").notNull().default(0),
    bicycleGoal: integer("bicycle_goal").notNull().default(0),
    longGoal: integer("long_goal").notNull().default(0),
    turtleGoal: integer("turtle_goal").notNull().default(0),
    poolShot: integer("pool_shot").notNull().default(0),
    overtimeGoal: integer("overtime_goal").notNull().default(0),
    hatTrick: integer("hat_trick").notNull().default(0),
    playmaker: integer("playmaker").notNull().default(0),
    epicSave: integer("epic_save").notNull().default(0),
    savior: integer("savior").notNull().default(0),
    center: integer("center").notNull().default(0),
    clear: integer("clear").notNull().default(0),
    firstTouch: integer("first_touch").notNull().default(0),
    breakoutDamage: integer("breakout_damage").notNull().default(0),
    breakoutDamageLarge: integer("breakout_damage_large").notNull().default(0),
    lowFive: integer("low_five").notNull().default(0),
    highFive: integer("high_five").notNull().default(0),
    hoopsSwishGoal: integer("hoops_swish_goal").notNull().default(0),
    bicycleHit: integer("bicycle_hit").notNull().default(0),
    ownGoal: integer("own_goal").notNull().default(0),
    koWinner: integer("ko_winner").notNull().default(0),
    koKnockout: integer("ko_knockout").notNull().default(0),
    koDoubleKO: integer("ko_double_ko").notNull().default(0),
    koTripleKO: integer("ko_triple_ko").notNull().default(0),
    koDeath: integer("ko_death").notNull().default(0),
    koLightHit: integer("ko_light_hit").notNull().default(0),
    koHeavyHit: integer("ko_heavy_hit").notNull().default(0),
    koAerialLightHit: integer("ko_aerial_light_hit").notNull().default(0),
    koAerialHeavyHit: integer("ko_aerial_heavy_hit").notNull().default(0),
    koHitTaken: integer("ko_hit_taken").notNull().default(0),
    koBlockTaken: integer("ko_block_taken").notNull().default(0),
    koGrabbed: integer("ko_grabbed").notNull().default(0),
    koThrown: integer("ko_thrown").notNull().default(0),
    koLightBlock: integer("ko_light_block").notNull().default(0),
    koHeavyBlock: integer("ko_heavy_block").notNull().default(0),
    koPlayerGrabbed: integer("ko_player_grabbed").notNull().default(0),
    koPlayerThrown: integer("ko_player_thrown").notNull().default(0),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
