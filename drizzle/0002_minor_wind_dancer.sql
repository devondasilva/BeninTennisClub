ALTER TABLE `partners` ADD `tagline` text;--> statement-breakpoint
ALTER TABLE `partners` ADD `banner` text;--> statement-breakpoint
ALTER TABLE `partners` ADD `placements` text DEFAULT 'HOME,EVENTS,COACHES,DASHBOARD,SHOP' NOT NULL;--> statement-breakpoint
ALTER TABLE `partners` ADD `impressions` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `partners` ADD `clicks` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `partners` ADD `contact_name` text;--> statement-breakpoint
ALTER TABLE `partners` ADD `contact_email` text;--> statement-breakpoint
ALTER TABLE `partners` ADD `contact_phone` text;