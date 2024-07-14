CREATE TABLE `arenas` (
	`id` integer PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `cars` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`picture` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` integer PRIMARY KEY NOT NULL,
	`uid` text,
	`plateform` text,
	`splitScreenId` text,
	`name` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `code` ON `arenas` (`code`);