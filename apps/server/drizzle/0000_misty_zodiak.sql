CREATE TABLE `grudges` (
	`id` text PRIMARY KEY NOT NULL,
	`target_name` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`resolved_at` integer
);
--> statement-breakpoint
CREATE INDEX `grudges_created_at_idx` ON `grudges` (`created_at`);