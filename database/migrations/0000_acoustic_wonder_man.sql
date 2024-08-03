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
	`uid` text NOT NULL,
	`planning_id` integer,
	`score_team_1` integer DEFAULT 0 NOT NULL,
	`score_team_2` integer DEFAULT 0 NOT NULL,
	`duration` integer,
	`arena_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`planning_id`) REFERENCES `planning`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`arena_id`) REFERENCES `arena`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `planning` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`season_id` integer,
	`team_1_id` integer NOT NULL,
	`team_2_id` integer NOT NULL,
	`length` integer DEFAULT 5 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`season_id`) REFERENCES `season`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_1_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_2_id`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `player` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uid` text,
	`plateform` text,
	`splitScreenId` text,
	`name` text,
	`carId` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`carId`) REFERENCES `car`(`id`) ON UPDATE no action ON DELETE no action
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
CREATE UNIQUE INDEX `code` ON `arena` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `uid` ON `game` (`uid`);--> statement-breakpoint
CREATE UNIQUE INDEX `token` ON `tournament` (`token`);