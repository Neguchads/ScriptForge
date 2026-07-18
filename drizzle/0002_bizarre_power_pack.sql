CREATE TABLE `style_combinations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`genres` json NOT NULL,
	`subgenres` json NOT NULL,
	`characteristics` json NOT NULL,
	`influences` json NOT NULL,
	`eras` json NOT NULL,
	`vocalStyles` json NOT NULL,
	`productionTechniques` json NOT NULL,
	`generatedPrompt` text,
	`isFavorite` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `style_combinations_id` PRIMARY KEY(`id`)
);
