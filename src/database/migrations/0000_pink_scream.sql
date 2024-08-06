CREATE TABLE `arena` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `car` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`picture` blob NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `game` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`planning_id` integer,
	`score_team_1` integer DEFAULT 0 NOT NULL,
	`score_team_2` integer DEFAULT 0 NOT NULL,
	`duration` integer,
	`arena_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`planning_id`) REFERENCES `versus`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`arena_id`) REFERENCES `arena`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `player` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uid` text,
	`plateform` text,
	`splitScreenId` text,
	`name` text,
	`carId` integer,
	`tournamentId` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`carId`) REFERENCES `car`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tournamentId`) REFERENCES `tournament`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `season` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tournament_id` integer,
	`name` text NOT NULL,
	`description` text,
	`team_length` integer DEFAULT 3 NOT NULL,
	`default_game_length` integer DEFAULT 5 NOT NULL,
	`start_at` text NOT NULL,
	`end_at` text NOT NULL,
	`logo` blob,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`tournament_id`) REFERENCES `tournament`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `statistic` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` integer,
	`player_id` integer,
	`mvp` integer DEFAULT 0 NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`goals` integer DEFAULT 0 NOT NULL,
	`shots` integer DEFAULT 0 NOT NULL,
	`assists` integer DEFAULT 0 NOT NULL,
	`saves` integer DEFAULT 0 NOT NULL,
	`ball_touches` integer DEFAULT 0 NOT NULL,
	`car_touches` integer DEFAULT 0 NOT NULL,
	`demolish` integer DEFAULT 0 NOT NULL,
	`demolition` integer DEFAULT 0 NOT NULL,
	`aerial_goal` integer DEFAULT 0 NOT NULL,
	`backwards_goal` integer DEFAULT 0 NOT NULL,
	`bicycle_goal` integer DEFAULT 0 NOT NULL,
	`long_goal` integer DEFAULT 0 NOT NULL,
	`turtle_goal` integer DEFAULT 0 NOT NULL,
	`pool_shot` integer DEFAULT 0 NOT NULL,
	`overtime_goal` integer DEFAULT 0 NOT NULL,
	`hat_trick` integer DEFAULT 0 NOT NULL,
	`playmaker` integer DEFAULT 0 NOT NULL,
	`epic_save` integer DEFAULT 0 NOT NULL,
	`savior` integer DEFAULT 0 NOT NULL,
	`center` integer DEFAULT 0 NOT NULL,
	`clear` integer DEFAULT 0 NOT NULL,
	`first_touch` integer DEFAULT 0 NOT NULL,
	`breakout_damage` integer DEFAULT 0 NOT NULL,
	`breakout_damage_large` integer DEFAULT 0 NOT NULL,
	`low_five` integer DEFAULT 0 NOT NULL,
	`high_five` integer DEFAULT 0 NOT NULL,
	`hoops_swish_goal` integer DEFAULT 0 NOT NULL,
	`bicycle_hit` integer DEFAULT 0 NOT NULL,
	`own_goal` integer DEFAULT 0 NOT NULL,
	`ko_winner` integer DEFAULT 0 NOT NULL,
	`ko_knockout` integer DEFAULT 0 NOT NULL,
	`ko_double_ko` integer DEFAULT 0 NOT NULL,
	`ko_triple_ko` integer DEFAULT 0 NOT NULL,
	`ko_death` integer DEFAULT 0 NOT NULL,
	`ko_light_hit` integer DEFAULT 0 NOT NULL,
	`ko_heavy_hit` integer DEFAULT 0 NOT NULL,
	`ko_aerial_light_hit` integer DEFAULT 0 NOT NULL,
	`ko_aerial_heavy_hit` integer DEFAULT 0 NOT NULL,
	`ko_hit_taken` integer DEFAULT 0 NOT NULL,
	`ko_block_taken` integer DEFAULT 0 NOT NULL,
	`ko_grabbed` integer DEFAULT 0 NOT NULL,
	`ko_thrown` integer DEFAULT 0 NOT NULL,
	`ko_light_block` integer DEFAULT 0 NOT NULL,
	`ko_heavy_block` integer DEFAULT 0 NOT NULL,
	`ko_player_grabbed` integer DEFAULT 0 NOT NULL,
	`ko_player_thrown` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`game_id`) REFERENCES `game`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `team` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`season_id` integer,
	`name` text NOT NULL,
	`players` text DEFAULT '[]' NOT NULL,
	`logo` blob,
	`color` text DEFAULT '#000000' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`season_id`) REFERENCES `season`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tournament` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`token` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `versus` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`season_id` integer,
	`team_1_id` integer NOT NULL,
	`team_2_id` integer NOT NULL,
	`length` integer DEFAULT 5 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`played_at` text,
	FOREIGN KEY (`season_id`) REFERENCES `season`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_1_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_2_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `code` ON `arena` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `token` ON `tournament` (`token`);
