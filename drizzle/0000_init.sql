CREATE TABLE `reminders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`channel_id` text NOT NULL,
	`target` text NOT NULL,
	`message` text NOT NULL,
	`time` integer NOT NULL,
	`created_by` text NOT NULL
);
