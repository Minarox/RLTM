CREATE TABLE `slot` (
	`id` text PRIMARY KEY DEFAULT (hex(randomblob(8))) NOT NULL,
	`tournament_id` text NOT NULL,
	`name` text NOT NULL,
	`token` text DEFAULT (hex(randomblob(38))) NOT NULL,
	`versus_id` integer,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`tournament_id`) REFERENCES `tournament`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`versus_id`) REFERENCES `versus`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `slot_token` ON `slot` (`token`);--> statement-breakpoint
-- Default slot of each tournament, with the token of the tournament (plugins already configured keep working) and its current versus
INSERT INTO `slot` (`id`, `tournament_id`, `name`, `token`, `versus_id`)
SELECT `t`.`id`, `t`.`id`, 'Default', `t`.`token`, (
	SELECT `v`.`id` FROM `versus` `v`
	INNER JOIN `season` `s` ON `s`.`id` = `v`.`season_id`
	WHERE `s`.`tournament_id` = `t`.`id`
		AND `s`.`start_at` <= date('now') AND `s`.`end_at` >= date('now')
		AND date(`v`.`played_at`) = date('now')
	LIMIT 1
)
FROM `tournament` `t`;--> statement-breakpoint
DROP INDEX `token`;--> statement-breakpoint
ALTER TABLE `tournament` DROP COLUMN `token`;