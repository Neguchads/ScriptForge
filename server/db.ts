import { eq, and, or, like, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  styleCombinations,
  InsertStyleCombination,
  scripts,
  ideas,
  niches,
  userPreferences,
  flashcards,
  flashcardCategories,
  userFlashcardProgress,
  InsertScript,
  InsertIdea,
  InsertUserPreferences,
  InsertFlashcard,
  InsertUserFlashcardProgress,
  userCertificates,
  searchHistory,
  InsertUserCertificate,
  InsertSearchHistory,
  scriptTemplates,
  youtubeUploads,
  InsertScriptTemplate,
  InsertYoutubeUpload,
  projects,
  generations,
  communityPosts,
  chatMessages,
  InsertProject,
  InsertGeneration,
  InsertCommunityPost,
  InsertChatMessage,
  aiMusic,
  InsertAiMusic,
  scriptMusicLinks,
  projectScriptLinks,
  InsertScriptMusicLink,
  InsertProjectScriptLink,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// YOUTUBE CONTENT CREATION HELPERS (ScriptTube)
// ============================================================================

// Scripts queries
export async function createScript(data: InsertScript) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(scripts).values(data);
}

export async function getUserScripts(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(scripts).where(eq(scripts.userId, userId));
}

export async function getScriptById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(scripts).where(eq(scripts.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateScript(id: number, data: Partial<InsertScript>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(scripts).set({ ...data, updatedAt: new Date() }).where(eq(scripts.id, id));
}

export async function deleteScript(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(scripts).where(eq(scripts.id, id));
}

// Ideas queries
export async function createIdea(data: InsertIdea) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(ideas).values(data);
}

export async function getUserIdeas(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(ideas).where(eq(ideas.userId, userId));
}

export async function deleteIdea(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(ideas).where(eq(ideas.id, id));
}

// Niches queries
export async function getAllNiches() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(niches);
}

export async function getNicheById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(niches).where(eq(niches.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// User Preferences queries
export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
}

export async function addUserPreference(data: InsertUserPreferences) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(userPreferences).values(data);
}

export async function removeUserPreference(userId: number, nicheId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(userPreferences).where(and(eq(userPreferences.userId, userId), eq(userPreferences.id, nicheId)));
}

// Flashcard queries
export async function getAllFlashcardCategories() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(flashcardCategories);
}

export async function getFlashcardsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(flashcards).where(eq(flashcards.categoryId, categoryId));
}

export async function getAllFlashcards() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(flashcards);
}

export async function getUserFlashcardProgress(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(userFlashcardProgress).where(eq(userFlashcardProgress.userId, userId));
}

export async function updateFlashcardProgress(userId: number, flashcardId: number, learned: "not_started" | "learning" | "learned") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(userFlashcardProgress)
    .where(and(eq(userFlashcardProgress.userId, userId), eq(userFlashcardProgress.flashcardId, flashcardId)))
    .limit(1);
  
  if (existing.length > 0) {
    return db.update(userFlashcardProgress)
      .set({ learned, reviewCount: (existing[0].reviewCount || 0) + 1, updatedAt: new Date() })
      .where(and(eq(userFlashcardProgress.userId, userId), eq(userFlashcardProgress.flashcardId, flashcardId)));
  } else {
    return db.insert(userFlashcardProgress).values({
      userId,
      flashcardId,
      learned,
      reviewCount: 1,
    });
  }
}

export async function searchFlashcards(query: string) {
  const db = await getDb();
  if (!db) return [];

  const searchTerm = `%${query}%`;
  const results = await db.select()
    .from(flashcards)
    .where(
      or(
        like(flashcards.question, searchTerm),
        like(flashcards.answer, searchTerm),
        like(flashcards.tips, searchTerm)
      )
    )
    .limit(20);
  
  return results;
}

export async function getUserCertificates(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const results = await db.select()
    .from(userCertificates)
    .where(eq(userCertificates.userId, userId))
    .orderBy(desc(userCertificates.completedAt));
  
  return results;
}

export async function createCertificate(data: InsertUserCertificate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(userCertificates).values(data);
}

export async function addSearchHistory(data: InsertSearchHistory) {
  const db = await getDb();
  if (!db) return;

  await db.insert(searchHistory).values(data);
}

export async function getSearchHistory(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  const results = await db.select()
    .from(searchHistory)
    .where(eq(searchHistory.userId, userId))
    .orderBy(desc(searchHistory.createdAt))
    .limit(limit);
  
  return results;
}

export async function getAllScriptTemplates() {
  const db = await getDb();
  if (!db) return [];

  const results = await db.select().from(scriptTemplates).orderBy(scriptTemplates.type);
  return results;
}

export async function getScriptTemplateById(templateId: number) {
  const db = await getDb();
  if (!db) return null;

  const results = await db.select().from(scriptTemplates).where(eq(scriptTemplates.id, templateId)).limit(1);
  return results.length > 0 ? results[0] : null;
}

export async function getScriptTemplatesByType(type: string) {
  const db = await getDb();
  if (!db) return [];

  const results = await db.select().from(scriptTemplates).where(eq(scriptTemplates.type, type));
  return results;
}

export async function createYoutubeUpload(data: InsertYoutubeUpload) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(youtubeUploads).values(data);
  return result;
}

export async function getUserYoutubeUploads(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const results = await db.select()
    .from(youtubeUploads)
    .where(eq(youtubeUploads.userId, userId))
    .orderBy(desc(youtubeUploads.createdAt));
  
  return results;
}

export async function getYoutubeUploadById(uploadId: number) {
  const db = await getDb();
  if (!db) return null;

  const results = await db.select()
    .from(youtubeUploads)
    .where(eq(youtubeUploads.id, uploadId))
    .limit(1);
  
  return results.length > 0 ? results[0] : null;
}

export async function updateYoutubeUploadStatus(uploadId: number, status: string, youtubeVideoId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = { status, updatedAt: new Date() };
  if (youtubeVideoId) {
    updateData.youtubeVideoId = youtubeVideoId;
    updateData.publishedAt = new Date();
  }

  return db.update(youtubeUploads)
    .set(updateData)
    .where(eq(youtubeUploads.id, uploadId));
}

// ============================================================================
// MUSIC GENERATION HELPERS (Suno Forge)
// ============================================================================

// Projects queries
export async function createProject(userId: number, data: Omit<InsertProject, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(projects).values({ ...data, userId });
}

export async function getUserProjects(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(projects).where(eq(projects.userId, userId));
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateProject(id: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(projects).set({ ...data, updatedAt: new Date() }).where(eq(projects.id, id));
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(projects).where(eq(projects.id, id));
}

// Generations queries
export async function createGeneration(userId: number, data: Omit<InsertGeneration, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(generations).values({ ...data, userId });
}

export async function getUserGenerations(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(generations).where(eq(generations.userId, userId)).orderBy(desc(generations.createdAt));
}

export async function getGenerationById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(generations).where(eq(generations.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateGeneration(id: number, data: Partial<InsertGeneration>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(generations).set({ ...data, updatedAt: new Date() }).where(eq(generations.id, id));
}

export async function deleteGeneration(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(generations).where(eq(generations.id, id));
}

// Community Posts queries
export async function createCommunityPost(userId: number, data: Omit<InsertCommunityPost, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(communityPosts).values({ ...data, userId });
}

export async function getCommunityPosts(limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(communityPosts).orderBy(desc(communityPosts.createdAt)).limit(limit);
}

export async function getUserCommunityPosts(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(communityPosts).where(eq(communityPosts.userId, userId)).orderBy(desc(communityPosts.createdAt));
}

// Chat Messages queries
export async function createChatMessage(userId: number, data: Omit<InsertChatMessage, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(chatMessages).values({ ...data, userId });
}

export async function getUserChatMessages(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(chatMessages).where(eq(chatMessages.userId, userId)).orderBy(desc(chatMessages.createdAt)).limit(limit);
}

// ============================================================================
// CROSS-PLATFORM INTEGRATION HELPERS
// ============================================================================

// Script-Music Links
export async function createScriptMusicLink(userId: number, data: Omit<InsertScriptMusicLink, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(scriptMusicLinks).values({ ...data, userId });
}

export async function getScriptMusicLinks(scriptId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(scriptMusicLinks).where(eq(scriptMusicLinks.scriptId, scriptId));
}

export async function deleteScriptMusicLink(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(scriptMusicLinks).where(eq(scriptMusicLinks.id, id));
}

// Project-Script Links
export async function createProjectScriptLink(userId: number, data: Omit<InsertProjectScriptLink, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(projectScriptLinks).values({ ...data, userId });
}

export async function getProjectScriptLinks(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(projectScriptLinks).where(eq(projectScriptLinks.projectId, projectId)).orderBy(projectScriptLinks.order);
}

export async function deleteProjectScriptLink(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(projectScriptLinks).where(eq(projectScriptLinks.id, id));
}

// AI Music (legacy)
export async function createAiMusic(userId: number, data: Omit<InsertAiMusic, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(aiMusic).values({ ...data, userId });
}

export async function getUserAiMusic(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(aiMusic).where(eq(aiMusic.userId, userId)).orderBy(desc(aiMusic.createdAt));
}

export async function getAiMusicById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(aiMusic).where(eq(aiMusic.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateAiMusic(id: number, data: Partial<InsertAiMusic>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(aiMusic).set({ ...data, updatedAt: new Date() }).where(eq(aiMusic.id, id));
}

// ============================================================================
// STYLE COMBINATIONS QUERIES (Suno Forge)
// ============================================================================

export async function saveStyleCombination(userId: number, combination: Omit<InsertStyleCombination, 'userId'>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save style combination: database not available");
    return undefined;
  }

  try {
    const result = await db.insert(styleCombinations).values({
      ...combination,
      userId,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to save style combination:", error);
    throw error;
  }
}

export async function getUserStyleCombinations(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get style combinations: database not available");
    return [];
  }

  try {
    const result = await db.select().from(styleCombinations).where(eq(styleCombinations.userId, userId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get style combinations:", error);
    return [];
  }
}

export async function deleteStyleCombination(userId: number, combinationId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete style combination: database not available");
    return false;
  }

  try {
    await db.delete(styleCombinations).where(
      and(eq(styleCombinations.id, combinationId), eq(styleCombinations.userId, userId))
    );
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete style combination:", error);
    return false;
  }
}

export async function toggleStyleCombinationFavorite(userId: number, combinationId: number, isFavorite: boolean) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update style combination: database not available");
    return false;
  }

  try {
    await db.update(styleCombinations)
      .set({ isFavorite })
      .where(and(eq(styleCombinations.id, combinationId), eq(styleCombinations.userId, userId)));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update style combination:", error);
    return false;
  }
}
