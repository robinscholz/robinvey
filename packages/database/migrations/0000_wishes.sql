CREATE TABLE `wishes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`shop` text DEFAULT '' NOT NULL,
	`price` real,
	`image_source` text DEFAULT '' NOT NULL,
	`image_version` integer DEFAULT 0 NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`added` text DEFAULT '' NOT NULL
);
