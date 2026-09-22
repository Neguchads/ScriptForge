CREATE TABLE `ai_music` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`prompt` text NOT NULL,
	`enhancedPrompt` text,
	`style` varchar(50) DEFAULT 'pop',
	`duration` varchar(20) DEFAULT 'medium',
	`status` varchar(50) DEFAULT 'generating',
	`musicUrl` varchar(500),
	`sunoMusicId` varchar(255),
	`error` text,
	`ideaId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_music_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`generationId` int NOT NULL,
	`shareToken` varchar(64) NOT NULL,
	`exportType` enum('pdf','midi','json','embed','markdown') NOT NULL,
	`title` varchar(300),
	`description` text,
	`viewCount` int NOT NULL DEFAULT 0,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exports_id` PRIMARY KEY(`id`),
	CONSTRAINT `exports_shareToken_unique` UNIQUE(`shareToken`)
);
--> statement-breakpoint
CREATE TABLE `flashcard_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(50),
	`color` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `flashcard_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `flashcard_categories_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `flashcards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`tips` text,
	`resources` text,
	`difficulty` enum('beginner','intermediate','advanced') DEFAULT 'beginner',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `flashcards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ideas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nicheId` int,
	`idea` text NOT NULL,
	`source` varchar(50),
	`musicGenerationId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ideas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `niches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `niches_id` PRIMARY KEY(`id`),
	CONSTRAINT `niches_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `project_script_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int NOT NULL,
	`scriptId` int NOT NULL,
	`order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_script_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`categoryId` int NOT NULL,
	`score` int NOT NULL,
	`totalQuestions` int NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalPoints` int NOT NULL DEFAULT 0,
	`quizzesCompleted` int NOT NULL DEFAULT 0,
	`rank` int DEFAULT 0,
	`badge` varchar(64),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quiz_scores_id` PRIMARY KEY(`id`),
	CONSTRAINT `quiz_scores_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `script_music_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`scriptId` int NOT NULL,
	`musicGenerationId` int NOT NULL,
	`linkType` enum('soundtrack','background','theme','custom') DEFAULT 'custom',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `script_music_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `script_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`type` varchar(50) NOT NULL,
	`structure` text NOT NULL,
	`tone` varchar(100),
	`estimatedDuration` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `script_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scripts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nicheId` int,
	`title` varchar(255) NOT NULL,
	`hook` text,
	`introduction` text,
	`mainContent` text,
	`callToAction` text,
	`fullScript` text,
	`seoTitle` varchar(255),
	`seoDescription` text,
	`tags` text,
	`thumbnailPrompt` text,
	`thumbnailUrl` text,
	`musicGenerationId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scripts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `search_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`query` varchar(255) NOT NULL,
	`resultCount` int DEFAULT 0,
	`searchType` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `search_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`categoryId` int NOT NULL,
	`certificateCode` varchar(50) NOT NULL,
	`completedFlashcards` int NOT NULL,
	`totalFlashcards` int NOT NULL,
	`completionPercentage` int NOT NULL,
	`completedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_certificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_certificates_certificateCode_unique` UNIQUE(`certificateCode`)
);
--> statement-breakpoint
CREATE TABLE `user_flashcard_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`flashcardId` int NOT NULL,
	`learned` enum('not_started','learning','learned') DEFAULT 'not_started',
	`reviewCount` int DEFAULT 0,
	`lastReviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_flashcard_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `video_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`youtubeVideoId` varchar(255) NOT NULL,
	`title` text,
	`views` int DEFAULT 0,
	`likes` int DEFAULT 0,
	`comments` int DEFAULT 0,
	`shares` int DEFAULT 0,
	`watchTime` int DEFAULT 0,
	`ctr` varchar(10),
	`retention` varchar(10),
	`publishedAt` timestamp,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `video_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_logs` (
	`id` varchar(36) NOT NULL,
	`provider` varchar(50) NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`payload` text NOT NULL,
	`status` varchar(50) DEFAULT 'pending',
	`errorMessage` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	CONSTRAINT `webhook_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_retries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`webhookId` varchar(36) NOT NULL,
	`provider` varchar(50) NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`payload` text NOT NULL,
	`retryCount` int DEFAULT 0,
	`maxRetries` int DEFAULT 3,
	`nextRetryAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webhook_retries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `youtube_auth` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`accessToken` text NOT NULL,
	`refreshToken` text,
	`expiresAt` timestamp,
	`channelId` varchar(255),
	`channelName` varchar(255),
	`connectedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `youtube_auth_id` PRIMARY KEY(`id`),
	CONSTRAINT `youtube_auth_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `youtube_uploads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`scriptId` int,
	`youtubeVideoId` varchar(255),
	`title` varchar(255) NOT NULL,
	`description` text,
	`tags` text,
	`thumbnailUrl` varchar(500),
	`status` varchar(50) DEFAULT 'draft',
	`publishedAt` timestamp,
	`youtubeAuthToken` text,
	`youtubeRefreshToken` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `youtube_uploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `generations` MODIFY COLUMN `type` enum('lyrics','style_prompt','full_song','image','audio_lab','chat','script','idea','thumbnail') NOT NULL;--> statement-breakpoint
ALTER TABLE `generations` ADD `audioUrl` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `type` enum('music','video','mixed') DEFAULT 'mixed';--> statement-breakpoint
ALTER TABLE `user_preferences` ADD `favoriteNiche` varchar(100);