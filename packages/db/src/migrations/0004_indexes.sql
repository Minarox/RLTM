CREATE INDEX `match_versus` ON `match` (`versus_id`);--> statement-breakpoint
CREATE INDEX `match_guid` ON `match` (`guid`);--> statement-breakpoint
CREATE INDEX `player_uid` ON `player` (`uid`);--> statement-breakpoint
CREATE INDEX `season_tournament` ON `season` (`tournament_id`);--> statement-breakpoint
CREATE INDEX `slot_tournament` ON `slot` (`tournament_id`);--> statement-breakpoint
CREATE INDEX `statistic_match_player` ON `statistic` (`match_id`,`player_id`);--> statement-breakpoint
CREATE INDEX `team_season` ON `team` (`season_id`);--> statement-breakpoint
CREATE INDEX `versus_season` ON `versus` (`season_id`);