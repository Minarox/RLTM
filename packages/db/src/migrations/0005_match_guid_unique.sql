DROP INDEX `match_guid`;--> statement-breakpoint
-- A guid saved for several matches is kept on the oldest one
UPDATE `match` SET `guid` = NULL
WHERE `guid` IS NOT NULL AND EXISTS (
	SELECT 1 FROM `match` `other` WHERE `other`.`guid` = `match`.`guid` AND `other`.`id` < `match`.`id`
);--> statement-breakpoint
CREATE UNIQUE INDEX `match_guid` ON `match` (`guid`);
