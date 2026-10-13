-- A versus already shown by another slot is removed from the most recent slots
UPDATE `slot` SET `versus_id` = NULL
WHERE `versus_id` IS NOT NULL AND EXISTS (
	SELECT 1 FROM `slot` `other`
	WHERE `other`.`versus_id` = `slot`.`versus_id`
		AND (`other`.`created_at` < `slot`.`created_at` OR (`other`.`created_at` = `slot`.`created_at` AND `other`.`rowid` < `slot`.`rowid`))
);--> statement-breakpoint
CREATE UNIQUE INDEX `slot_versus` ON `slot` (`versus_id`);
