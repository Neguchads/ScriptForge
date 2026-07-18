import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * ============================================================================
 * SHARED TABLES (Both ScriptTube & Suno Forge)
 * ============================================================================
 */

/**
 * Core user table backing auth flow.
 * Single user for both YouTube content creation and music generation.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Unified user preferences for both platforms.
 * Includes YouTube preferences (niche, language) and music preferences (genre, BPM).
 */
export const userPreferences = mysqlTable("user_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // YouTube preferences
  favoriteNiche: varchar("favoriteNiche", { length: 100 }),
  // Music preferences
  favoriteGenre: varchar("favoriteGenre", { length: 100 }),
  favoriteKey: varchar("favoriteKey", { length: 20 }),
  favoriteStyle: varchar("favoriteStyle", { length: 200 }),
  favoriteMood: varchar("favoriteMood", { length: 100 }),
  defaultLanguage: varchar("defaultLanguage", { length: 10 }).default("pt-BR"),
  defaultBpm: int("defaultBpm").default(120),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;

/**
 * ============================================================================
 * YOUTUBE CONTENT CREATION TABLES (ScriptTube)
 * ============================================================================
 */

export const niches = mysqlTable("niches", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Niche = typeof niches.$inferSelect;
export type InsertNiche = typeof niches.$inferInsert;

export const ideas = mysqlTable("ideas", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  nicheId: int("nicheId"),
  idea: text("idea").notNull(),
  source: varchar("source", { length: 50 }), // 'manual', 'ai_generated', 'voice_transcribed'
  musicGenerationId: int("musicGenerationId"), // Link to music generation (Suno)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Idea = typeof ideas.$inferSelect;
export type InsertIdea = typeof ideas.$inferInsert;

export const scripts = mysqlTable("scripts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  nicheId: int("nicheId"),
  title: varchar("title", { length: 255 }).notNull(),
  hook: text("hook"),
  introduction: text("introduction"),
  mainContent: text("mainContent"),
  callToAction: text("callToAction"),
  fullScript: text("fullScript"),
  seoTitle: varchar("seoTitle", { length: 255 }),
  seoDescription: text("seoDescription"),
  tags: text("tags"), // JSON array stored as string
  thumbnailPrompt: text("thumbnailPrompt"),
  thumbnailUrl: text("thumbnailUrl"),
  musicGenerationId: int("musicGenerationId"), // Link to music generation (Suno)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Script = typeof scripts.$inferSelect;
export type InsertScript = typeof scripts.$inferInsert;

export const scriptTemplates = mysqlTable("script_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // 'tutorial', 'review', 'vlog', 'educational', 'storytelling'
  structure: text("structure").notNull(), // JSON com estrutura do template
  tone: varchar("tone", { length: 100 }), // 'formal', 'casual', 'energetic', 'educational'
  estimatedDuration: int("estimatedDuration"), // em minutos
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScriptTemplate = typeof scriptTemplates.$inferSelect;
export type InsertScriptTemplate = typeof scriptTemplates.$inferInsert;

export const flashcardCategories = mysqlTable("flashcard_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FlashcardCategory = typeof flashcardCategories.$inferSelect;
export type InsertFlashcardCategory = typeof flashcardCategories.$inferInsert;

export const flashcards = mysqlTable("flashcards", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  tips: text("tips"),
  resources: text("resources"), // JSON array of links
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("beginner"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Flashcard = typeof flashcards.$inferSelect;
export type InsertFlashcard = typeof flashcards.$inferInsert;

export const userFlashcardProgress = mysqlTable("user_flashcard_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  flashcardId: int("flashcardId").notNull(),
  learned: mysqlEnum("learned", ["not_started", "learning", "learned"]).default("not_started"),
  reviewCount: int("reviewCount").default(0),
  lastReviewedAt: timestamp("lastReviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserFlashcardProgress = typeof userFlashcardProgress.$inferSelect;
export type InsertUserFlashcardProgress = typeof userFlashcardProgress.$inferInsert;

export const userCertificates = mysqlTable("user_certificates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId").notNull(),
  certificateCode: varchar("certificateCode", { length: 50 }).notNull().unique(),
  completedFlashcards: int("completedFlashcards").notNull(),
  totalFlashcards: int("totalFlashcards").notNull(),
  completionPercentage: int("completionPercentage").notNull(),
  completedAt: timestamp("completedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserCertificate = typeof userCertificates.$inferSelect;
export type InsertUserCertificate = typeof userCertificates.$inferInsert;

export const searchHistory = mysqlTable("search_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  query: varchar("query", { length: 255 }).notNull(),
  resultCount: int("resultCount").default(0),
  searchType: varchar("searchType", { length: 50 }), // 'flashcard', 'guide', 'all'
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SearchHistory = typeof searchHistory.$inferSelect;
export type InsertSearchHistory = typeof searchHistory.$inferInsert;

// Quiz Mode Tables
export const quizAttempts = mysqlTable("quiz_attempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId").notNull(),
  score: int("score").notNull(),
  totalQuestions: int("totalQuestions").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export const quizScores = mysqlTable("quiz_scores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  totalPoints: int("totalPoints").default(0).notNull(),
  quizzesCompleted: int("quizzesCompleted").default(0).notNull(),
  rank: int("rank").default(0),
  badge: varchar("badge", { length: 64 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// YouTube OAuth Tables
export const youtubeAuth = mysqlTable("youtube_auth", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken"),
  expiresAt: timestamp("expiresAt"),
  channelId: varchar("channelId", { length: 255 }),
  channelName: varchar("channelName", { length: 255 }),
  connectedAt: timestamp("connectedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// YouTube Upload Tables
export const youtubeUploads = mysqlTable("youtube_uploads", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  scriptId: int("scriptId"),
  youtubeVideoId: varchar("youtubeVideoId", { length: 255 }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  tags: text("tags"), // JSON array
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }),
  status: varchar("status", { length: 50 }).default("draft"), // 'draft', 'scheduled', 'published', 'failed'
  publishedAt: timestamp("publishedAt"),
  youtubeAuthToken: text("youtubeAuthToken"), // encrypted
  youtubeRefreshToken: text("youtubeRefreshToken"), // encrypted
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type YoutubeUpload = typeof youtubeUploads.$inferSelect;
export type InsertYoutubeUpload = typeof youtubeUploads.$inferInsert;

// Analytics Tables
export const videoAnalytics = mysqlTable("video_analytics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  youtubeVideoId: varchar("youtubeVideoId", { length: 255 }).notNull(),
  title: text("title"),
  views: int("views").default(0),
  likes: int("likes").default(0),
  comments: int("comments").default(0),
  shares: int("shares").default(0),
  watchTime: int("watchTime").default(0),
  ctr: varchar("ctr", { length: 10 }),
  retention: varchar("retention", { length: 10 }),
  publishedAt: timestamp("publishedAt"),
  syncedAt: timestamp("syncedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VideoAnalytic = typeof videoAnalytics.$inferSelect;

/**
 * ============================================================================
 * MUSIC GENERATION TABLES (Suno Forge)
 * ============================================================================
 */

/**
 * Projects — user-created projects to group generations.
 * Can be used for both music and video projects.
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["music", "video", "mixed"]).default("mixed"), // Project type
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Generations — all AI-generated content (lyrics, prompts, images, scripts).
 * Unified table for both music and video content.
 */
export const generations = mysqlTable("generations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  type: mysqlEnum("type", [
    "lyrics",
    "style_prompt",
    "full_song",
    "image",
    "audio_lab",
    "chat",
    "script",
    "idea",
    "thumbnail",
  ]).notNull(),
  title: varchar("title", { length: 300 }),
  content: text("content").notNull(),
  metadata: json("metadata"),
  imageUrl: text("imageUrl"),
  audioUrl: text("audioUrl"),
  isFavorite: boolean("isFavorite").default(false).notNull(),
  isPublic: boolean("isPublic").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Generation = typeof generations.$inferSelect;
export type InsertGeneration = typeof generations.$inferInsert;

/**
 * Community posts — public gallery of shared creations.
 */
export const communityPosts = mysqlTable("community_posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  generationId: int("generationId").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  genre: varchar("genre", { length: 100 }),
  mood: varchar("mood", { length: 100 }),
  tags: varchar("tags", { length: 500 }),
  likes: int("likes").default(0).notNull(),
  remixCount: int("remixCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;

/**
 * Chat messages — conversation history for the AI assistant.
 */
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * Style combinations — user-saved style mixer combinations for quick reuse.
 */
export const styleCombinations = mysqlTable("style_combinations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  genres: json("genres").notNull(),
  subgenres: json("subgenres").notNull(),
  characteristics: json("characteristics").notNull(),
  influences: json("influences").notNull(),
  eras: json("eras").notNull(),
  vocalStyles: json("vocalStyles").notNull(),
  productionTechniques: json("productionTechniques").notNull(),
  generatedPrompt: text("generatedPrompt"),
  isFavorite: boolean("isFavorite").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StyleCombination = typeof styleCombinations.$inferSelect;
export type InsertStyleCombination = typeof styleCombinations.$inferInsert;

/**
 * Exports — shared exports with unique URLs and embed codes.
 */
export const exports = mysqlTable("exports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  generationId: int("generationId").notNull(),
  shareToken: varchar("shareToken", { length: 64 }).notNull().unique(),
  exportType: mysqlEnum("exportType", ["pdf", "midi", "json", "embed", "markdown"]).notNull(),
  title: varchar("title", { length: 300 }),
  description: text("description"),
  viewCount: int("viewCount").default(0).notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Export = typeof exports.$inferSelect;
export type InsertExport = typeof exports.$inferInsert;

/**
 * ============================================================================
 * WEBHOOK & INTEGRATION TABLES
 * ============================================================================
 */

// Webhook Tables
export const webhookLogs = mysqlTable("webhook_logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  provider: varchar("provider", { length: 50 }).notNull(), // 'telegram', 'antigravity', 'musescore', 'youtube', 'suno'
  eventType: varchar("eventType", { length: 100 }).notNull(),
  payload: text("payload").notNull(),
  status: varchar("status", { length: 50 }).default("pending"), // 'pending', 'processing', 'success', 'failed'
  errorMessage: text("errorMessage"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
});

export const webhookRetries = mysqlTable("webhook_retries", {
  id: int("id").autoincrement().primaryKey(),
  webhookId: varchar("webhookId", { length: 36 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  payload: text("payload").notNull(),
  retryCount: int("retryCount").default(0),
  maxRetries: int("maxRetries").default(3),
  nextRetryAt: timestamp("nextRetryAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WebhookLog = typeof webhookLogs.$inferSelect;
export type InsertWebhookLog = typeof webhookLogs.$inferInsert;
export type WebhookRetry = typeof webhookRetries.$inferSelect;
export type InsertWebhookRetry = typeof webhookRetries.$inferInsert;

/**
 * ============================================================================
 * CROSS-PLATFORM INTEGRATION TABLES
 * ============================================================================
 */

/**
 * Script-Music Links — relationships between scripts and music generations.
 * Enables fluxo: Script → Music or Music → Script
 */
export const scriptMusicLinks = mysqlTable("script_music_links", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  scriptId: int("scriptId").notNull(),
  musicGenerationId: int("musicGenerationId").notNull(),
  linkType: mysqlEnum("linkType", ["soundtrack", "background", "theme", "custom"]).default("custom"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScriptMusicLink = typeof scriptMusicLinks.$inferSelect;
export type InsertScriptMusicLink = typeof scriptMusicLinks.$inferInsert;

/**
 * Project-Script Links — relationships between projects and scripts.
 * Enables organizing scripts within projects.
 */
export const projectScriptLinks = mysqlTable("project_script_links", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId").notNull(),
  scriptId: int("scriptId").notNull(),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectScriptLink = typeof projectScriptLinks.$inferSelect;
export type InsertProjectScriptLink = typeof projectScriptLinks.$inferInsert;

/**
 * AI Music (legacy from ScriptTube) — for backward compatibility
 */
export const aiMusic = mysqlTable("ai_music", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  prompt: text("prompt").notNull(),
  enhancedPrompt: text("enhancedPrompt"),
  style: varchar("style", { length: 50 }).default("pop"),
  duration: varchar("duration", { length: 20 }).default("medium"),
  status: varchar("status", { length: 50 }).default("generating"), // 'generating', 'completed', 'failed'
  musicUrl: varchar("musicUrl", { length: 500 }),
  sunoMusicId: varchar("sunoMusicId", { length: 255 }),
  error: text("error"),
  ideaId: int("ideaId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiMusic = typeof aiMusic.$inferSelect;
export type InsertAiMusic = typeof aiMusic.$inferInsert;

// Type exports for quiz
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type QuizScore = typeof quizScores.$inferSelect;
export type YoutubeAuth = typeof youtubeAuth.$inferSelect;
