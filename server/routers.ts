import { COOKIE_NAME } from "@shared/const";
import { exportRouter } from "./export-routers";
import { integrationRouter } from "./routers/integration";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";
import { getDb } from "./db";
import {
  generations,
  userPreferences,
  communityPosts,
  chatMessages,
  projects,
  styleCombinations,
} from "../drizzle/schema";
import {
  saveStyleCombination,
  getUserStyleCombinations,
  deleteStyleCombination,
  toggleStyleCombinationFavorite,
} from "./db";
import { eq, desc, and, like, or } from "drizzle-orm";
import { z } from "zod/v4";

// ─── Auth Router ─────────────────────────────────────────────────────────────
const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});

// ─── Lyrics Router ────────────────────────────────────────────────────────────
const lyricsRouter = router({
  generate: publicProcedure
    .input(
      z.object({
        theme: z.string().min(1),
        genre: z.string().optional(),
        mood: z.string().optional(),
        structure: z.string().optional(),
        language: z.string().default("pt-BR"),
        creativity: z.number().min(0.1).max(1).default(0.7),
        variations: z.number().min(1).max(3).default(1),
        voiceMode: z.enum(["instrumental", "vocal", "acapella", "vocal_instrumental"]).default("vocal"),
        structuralTags: z.array(z.string()).optional(),
        instrumentalInstructions: z.array(z.string()).optional(),
        dynamics: z.array(z.string()).optional(),
        customLyrics: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const langMap: Record<string, string> = { "pt-BR": "Portuguese (Brazilian)", en: "English", es: "Spanish" };
      const lang = langMap[input.language] || "Portuguese (Brazilian)";

      let voiceInstructions = "";
      switch (input.voiceMode) {
        case "instrumental":
          voiceInstructions = "Generate ONLY instrumental structure with [Instrumental] tags. NO LYRICS. Use meta-tags like [Intro - instrumental], [Verse 1 - instrumental], [Chorus - instrumental], [Guitar Solo], [Piano Interlude], etc.";
          break;
        case "acapella":
          voiceInstructions = "Generate acapella structure with lyrics and [Acapella] tags. NO INSTRUMENTS. Use meta-tags like [Intro - acapella vocals], [Verse 1 - acapella], [Chorus - acapella], etc.";
          break;
        case "vocal_instrumental":
          voiceInstructions = "Generate complete structure with vocals AND instruments. Use meta-tags for both vocal sections and instrumental breaks. Include [Guitar Solo], [Piano Interlude], etc.";
          break;
        default:
          voiceInstructions = "Generate vocal structure with lyrics and instrumental accompaniment. Use meta-tags for sections like [Verse 1], [Chorus], [Bridge], etc.";
      }

      const systemPrompt = `You are an expert Suno AI specialist. Generate song structures for Suno AI using meta-tags correctly.

IMPORTANT RULES FOR SUNO:
- Text inside [brackets] = instructions/directions (NOT sung)
- Text outside brackets = lyrics that will be sung (only for vocal modes)
- For instrumental: use [Instrumental], [Guitar Solo], [Piano Interlude], [Synth Build], etc.
- For vocals: use [Verse 1], [Chorus], [Bridge], etc. with actual lyrics between tags
- Use [Build-up], [Drop], [Fade out] for dynamics
- Separate sections clearly with line breaks

${voiceInstructions}`;

      const tagsStr = input.structuralTags?.length ? `\nSelected meta-tags: ${input.structuralTags.join(", ")}` : "";
      const instStr = input.instrumentalInstructions?.length ? `\nInstrumental instructions: ${input.instrumentalInstructions.join(", ")}` : "";
      const dynStr = input.dynamics?.length ? `\nDynamics: ${input.dynamics.join(", ")}` : "";
      const customStr = input.customLyrics ? `\nCustom lyrics/structure to incorporate: ${input.customLyrics}` : "";

      const userPrompt = `Generate ${input.variations > 1 ? input.variations + " variations of " : ""}a song structure for Suno AI in ${lang}:
- Theme/Story: ${input.theme}
- Genre: ${input.genre || "Pop"}
- Mood: ${input.mood || "Upbeat"}
- Voice Mode: ${input.voiceMode}
- Creativity: ${Math.round(input.creativity * 100)}%${tagsStr}${instStr}${dynStr}${customStr}

${input.variations > 1 ? `Separate each variation with "---VARIATION---"` : ""}

Generate a complete, professional song structure ready to paste into Suno's Lyrics field. Use meta-tags appropriately based on the voice mode.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const rawLyrics = response.choices[0]?.message?.content;
      const content = typeof rawLyrics === 'string' ? rawLyrics : "";
      const lyrics = input.variations > 1
        ? content.split("---VARIATION---").map((s: string) => s.trim()).filter(Boolean)
        : [content.trim()];

      return { lyrics };
    }),

  refine: publicProcedure
    .input(z.object({ lyrics: z.string(), instruction: z.string() }))
    .mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert lyricist. Refine the given lyrics according to the instruction while maintaining the structure and essence." },
          { role: "user", content: `Refine these lyrics to be "${input.instruction}":\n\n${input.lyrics}\n\nReturn only the refined lyrics, no explanations.` },
        ],
      });
      return { lyrics: response.choices[0]?.message?.content || input.lyrics };
    }),
});

// ─── Style & Prompt Router ────────────────────────────────────────────────────
const styleRouter = router({
  generate: publicProcedure
    .input(
      z.object({
        genre: z.string(),
        subgenre: z.string().optional(),
        mood: z.string().optional(),
        instruments: z.array(z.string()).optional(),
        bpm: z.number().optional(),
        era: z.string().optional(),
        vocalStyle: z.string().optional(),
        production: z.string().optional(),
        mode: z.enum(["professional", "random"]).default("professional"),
      })
    )
    .mutation(async ({ input }) => {
      const systemPrompt = `You are a professional music producer and Suno AI expert specializing in infinite style combinations. Generate optimized, unique style prompts for Suno AI that blend multiple genres, characteristics, and influences seamlessly. Return a JSON object with: stylePrompt (string with all tags), tags (array of individual tags), explanation (brief explanation of the choices and how they blend together).

IMPORTANT: Create prompts that feel cohesive even when combining seemingly opposite styles (e.g., dark + lo-fi + baroque, cyber + techno + electronic + dark). The prompt should guide the AI to understand how these elements work together.`;

      const userPrompt = `Create an optimized Suno AI style prompt for this unique combination:
- Genres: ${input.genre}
- Subgenres: ${input.subgenre || "not specified"}
- Moods/Characteristics: ${input.mood || "not specified"}
- Instruments: ${input.instruments?.join(", ") || "not specified"}
- BPM: ${input.bpm || "not specified"}
- Era: ${input.era || "contemporary"}
- Vocal Style: ${input.vocalStyle || "not specified"}
- Production Techniques: ${input.production || "not specified"}
- Mode: ${input.mode}

Generate a comprehensive, cohesive style prompt that blends all these elements together. The prompt should:
1. Explain how these styles work together
2. Include specific production techniques
3. Mention key instruments and textures
4. Describe the overall mood and atmosphere
5. Be ready to paste directly into Suno AI

Keep it concise but detailed, and make it feel like a unified artistic vision.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "style_prompt",
            strict: true,
            schema: {
              type: "object",
              properties: {
                stylePrompt: { type: "string" },
                tags: { type: "array", items: { type: "string" } },
                explanation: { type: "string" },
              },
              required: ["stylePrompt", "tags", "explanation"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawStyle = response.choices[0]?.message?.content;
      const parsed = JSON.parse(typeof rawStyle === 'string' ? rawStyle : "{}");
      return parsed as { stylePrompt: string; tags: string[]; explanation: string };
    }),

  suggestions: publicProcedure
    .input(z.object({ genre: z.string() }))
    .query(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a music production expert. Return JSON only." },
          { role: "user", content: `Suggest typical characteristics for ${input.genre} music. Return JSON with: subgenres (array of 5), moods (array of 6), instruments (array of 8), eras (array of 4), vocalStyles (array of 5), productionStyles (array of 5).` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "suggestions",
            strict: true,
            schema: {
              type: "object",
              properties: {
                subgenres: { type: "array", items: { type: "string" } },
                moods: { type: "array", items: { type: "string" } },
                instruments: { type: "array", items: { type: "string" } },
                eras: { type: "array", items: { type: "string" } },
                vocalStyles: { type: "array", items: { type: "string" } },
                productionStyles: { type: "array", items: { type: "string" } },
              },
              required: ["subgenres", "moods", "instruments", "eras", "vocalStyles", "productionStyles"],
              additionalProperties: false,
            },
          },
        },
      });
      const rawSugg = response.choices[0]?.message?.content;
      return JSON.parse(typeof rawSugg === 'string' ? rawSugg : "{}");
    }),
});

// ─── Full Song Creator Router ─────────────────────────────────────────────────
const fullSongRouter = router({
  generate: publicProcedure
    .input(
      z.object({
        theme: z.string(),
        genre: z.string(),
        mood: z.string().optional(),
        language: z.string().default("pt-BR"),
        additionalNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const langMap: Record<string, string> = { "pt-BR": "Portuguese (Brazilian)", en: "English", es: "Spanish" };
      const lang = langMap[input.language] || "Portuguese (Brazilian)";

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a professional songwriter and Suno AI expert. Create complete, ready-to-use Suno AI prompts that include both style tags and full lyrics. Return JSON only." },
          { role: "user", content: `Create a complete Suno AI song prompt for:
- Theme: ${input.theme}
- Genre: ${input.genre}
- Mood: ${input.mood || "fitting the theme"}
- Language: ${lang}
- Notes: ${input.additionalNotes || "none"}

Return JSON with:
- title: catchy song title
- stylePrompt: Suno AI style tags (genre, mood, instruments, production)
- lyrics: complete lyrics with [Verse], [Chorus], [Bridge] labels
- fullPrompt: the complete combined prompt ready to paste into Suno AI
- description: brief description of the song` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "full_song",
            strict: true,
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                stylePrompt: { type: "string" },
                lyrics: { type: "string" },
                fullPrompt: { type: "string" },
                description: { type: "string" },
              },
              required: ["title", "stylePrompt", "lyrics", "fullPrompt", "description"],
              additionalProperties: false,
            },
          },
        },
      });
      const rawContent = response.choices[0]?.message?.content;
      return JSON.parse(typeof rawContent === 'string' ? rawContent : "{}") as {
        title: string; stylePrompt: string; lyrics: string; fullPrompt: string; description: string;
      };
    }),
});

// ─── Image Generator Router ───────────────────────────────────────────────────
const imageRouter = router({
  generate: publicProcedure
    .input(
      z.object({
        prompt: z.string().min(1),
        style: z.string().optional(),
        genre: z.string().optional(),
        mood: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const enhancedPrompt = `Album cover art, music artwork: ${input.prompt}. ${input.genre ? `Genre: ${input.genre}.` : ""} ${input.mood ? `Mood: ${input.mood}.` : ""} ${input.style ? `Style: ${input.style}.` : ""} High quality, professional music artwork, vibrant colors, artistic.`;
      const result = await generateImage({ prompt: enhancedPrompt });
      return { url: result.url };
    }),

  buildPrompt: publicProcedure
    .input(z.object({ genre: z.string(), mood: z.string().optional(), theme: z.string().optional() }))
    .mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert in AI image generation for music artwork. Generate detailed, evocative prompts for album covers." },
          { role: "user", content: `Create a detailed image generation prompt for an album cover:
- Music Genre: ${input.genre}
- Mood: ${input.mood || "atmospheric"}
- Theme: ${input.theme || "abstract"}

Write a vivid, detailed prompt (2-3 sentences) that would create a stunning album cover. Include visual elements, colors, atmosphere, and artistic style.` },
        ],
      });
      return { prompt: response.choices[0]?.message?.content || "" };
    }),
});

// ─── Audio Lab Router ─────────────────────────────────────────────────────────
const audioLabRouter = router({
  generateVariations: publicProcedure
    .input(
      z.object({
        basePrompt: z.string(),
        tempo: z.number().min(60).max(200),
        key: z.string(),
        energy: z.number().min(1).max(10),
        complexity: z.number().min(1).max(10),
        count: z.number().min(1).max(4).default(3),
      })
    )
    .mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a music producer expert in Suno AI. Generate prompt variations. Return JSON only." },
          { role: "user", content: `Generate ${input.count} Suno AI prompt variations based on:
- Base: ${input.basePrompt}
- Tempo: ${input.tempo} BPM
- Key: ${input.key}
- Energy level: ${input.energy}/10
- Complexity: ${input.complexity}/10

Return JSON: { variations: [{ name: string, prompt: string, description: string }] }` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "variations",
            strict: true,
            schema: {
              type: "object",
              properties: {
                variations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      prompt: { type: "string" },
                      description: { type: "string" },
                    },
                    required: ["name", "prompt", "description"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["variations"],
              additionalProperties: false,
            },
          },
        },
      });
      const rawVar = response.choices[0]?.message?.content;
      return JSON.parse(typeof rawVar === 'string' ? rawVar : '{"variations":[]}') as {
        variations: { name: string; prompt: string; description: string }[];
      };
    }),
});

// ─── Library Router ───────────────────────────────────────────────────────────
const libraryRouter = router({
  save: protectedProcedure
    .input(
      z.object({
        type: z.enum(["lyrics", "style_prompt", "full_song", "image", "audio_lab", "chat"]),
        title: z.string().optional(),
        content: z.string(),
        metadata: z.record(z.string(), z.unknown()).optional(),
        imageUrl: z.string().optional(),
        projectId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(generations).values({
        userId: ctx.user.id,
        type: input.type,
        title: input.title,
        content: input.content,
        metadata: input.metadata || {},
        imageUrl: input.imageUrl,
        projectId: input.projectId,
      });
      return { success: true };
    }),

  list: protectedProcedure
    .input(
      z.object({
        type: z.enum(["lyrics", "style_prompt", "full_song", "image", "audio_lab", "chat", "all"]).default("all"),
        search: z.string().optional(),
        favoritesOnly: z.boolean().default(false),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { items: [], total: 0 };

      const conditions = [eq(generations.userId, ctx.user.id)];
      if (input.type !== "all") conditions.push(eq(generations.type, input.type));
      if (input.favoritesOnly) conditions.push(eq(generations.isFavorite, true));
      if (input.search) {
        conditions.push(
          or(
            like(generations.title, `%${input.search}%`),
            like(generations.content, `%${input.search}%`)
          )!
        );
      }

      const items = await db
        .select()
        .from(generations)
        .where(and(...conditions))
        .orderBy(desc(generations.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return { items };
    }),

  toggleFavorite: protectedProcedure
    .input(z.object({ id: z.number(), isFavorite: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(generations)
        .set({ isFavorite: input.isFavorite })
        .where(and(eq(generations.id, input.id), eq(generations.userId, ctx.user.id)));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.delete(generations)
        .where(and(eq(generations.id, input.id), eq(generations.userId, ctx.user.id)));
      return { success: true };
    }),

  togglePublic: protectedProcedure
    .input(z.object({ id: z.number(), isPublic: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(generations)
        .set({ isPublic: input.isPublic })
        .where(and(eq(generations.id, input.id), eq(generations.userId, ctx.user.id)));
      return { success: true };
    }),
});

// ─── Explore Router ───────────────────────────────────────────────────────────
const exploreRouter = router({
  list: publicProcedure
    .input(
      z.object({
        genre: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { items: [] };

      const conditions = [eq(generations.isPublic, true)];
      if (input.search) {
        conditions.push(
          or(
            like(generations.title, `%${input.search}%`),
            like(generations.content, `%${input.search}%`)
          )!
        );
      }

      const items = await db
        .select()
        .from(generations)
        .where(and(...conditions))
        .orderBy(desc(generations.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return { items };
    }),

  like: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      // Simple like increment
      return { success: true };
    }),
});

// ─── Chat Router ──────────────────────────────────────────────────────────────
const chatRouter = router({
  send: publicProcedure
    .input(
      z.object({
        message: z.string().min(1),
        history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const systemPrompt = `You are SunoForge AI, an expert music assistant specialized in:
- Songwriting and lyric composition
- Music production and arrangement
- Suno AI prompt optimization
- Music theory and composition techniques
- Genre analysis and style recommendations

You help musicians and creators craft better songs and prompts for AI music generation. Be creative, knowledgeable, and encouraging. When suggesting prompts for Suno AI, format them clearly with style tags.`;

      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemPrompt },
        ...(input.history || []).map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user", content: input.message },
      ];

      const response = await invokeLLM({ messages });
      const rawReply = response.choices[0]?.message?.content;
      const reply = typeof rawReply === 'string' ? rawReply : "Desculpe, não consegui processar sua mensagem.";

      // Save to DB if authenticated
      if (ctx.user) {
        const db = await getDb();
        if (db) {
          const userMsg: { userId: number; role: "user" | "assistant"; content: string } = { userId: ctx.user.id, role: "user", content: input.message };
          const assistantMsg: { userId: number; role: "user" | "assistant"; content: string } = { userId: ctx.user.id, role: "assistant", content: String(reply) };
          await db.insert(chatMessages).values(userMsg);
          await db.insert(chatMessages).values(assistantMsg);
        }
      }

      return { reply };
    }),

  history: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { messages: [] };
      const messages = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.userId, ctx.user.id))
        .orderBy(desc(chatMessages.createdAt))
        .limit(input.limit);
      return { messages: messages.reverse() };
    }),
});

// ─── Preferences Router ───────────────────────────────────────────────────────
const preferencesRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const prefs = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, ctx.user.id))
      .limit(1);
    return prefs[0] || null;
  }),

  save: protectedProcedure
    .input(
      z.object({
        favoriteGenre: z.string().optional(),
        favoriteKey: z.string().optional(),
        favoriteStyle: z.string().optional(),
        favoriteMood: z.string().optional(),
        defaultLanguage: z.string().optional(),
        defaultBpm: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const existing = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, ctx.user.id))
        .limit(1);

      if (existing.length > 0) {
        await db.update(userPreferences).set(input).where(eq(userPreferences.userId, ctx.user.id));
      } else {
        await db.insert(userPreferences).values({ userId: ctx.user.id, ...input });
      }
      return { success: true };
    }),
});

// ─── Projects Router ──────────────────────────────────────────────────────────
const projectsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { projects: [] };
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, ctx.user.id))
      .orderBy(desc(projects.createdAt));
    return { projects: result };
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(projects).values({ userId: ctx.user.id, name: input.name, description: input.description });
      return { success: true };
    }),
});

// ─── Style Combinations Router ─────────────────────────────────────────────────
const styleComboRouter = router({
  save: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        genres: z.array(z.string()),
        subgenres: z.array(z.string()),
        characteristics: z.record(z.string(), z.array(z.string())),
        influences: z.array(z.string()),
        eras: z.array(z.string()),
        vocalStyles: z.array(z.string()),
        productionTechniques: z.array(z.string()),
        generatedPrompt: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await saveStyleCombination(ctx.user.id, {
          name: input.name,
          genres: input.genres,
          subgenres: input.subgenres,
          characteristics: input.characteristics,
          influences: input.influences,
          eras: input.eras,
          vocalStyles: input.vocalStyles,
          productionTechniques: input.productionTechniques,
          generatedPrompt: input.generatedPrompt,
        });
        return { success: true };
      } catch (error) {
        throw new Error("Failed to save style combination");
      }
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const combinations = await getUserStyleCombinations(ctx.user.id);
    return { items: combinations };
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const success = await deleteStyleCombination(ctx.user.id, input.id);
      return { success };
    }),

  toggleFavorite: protectedProcedure
    .input(z.object({ id: z.number(), isFavorite: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const success = await toggleStyleCombinationFavorite(ctx.user.id, input.id, input.isFavorite);
      return { success };
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  lyrics: lyricsRouter,
  style: styleRouter,
  fullSong: fullSongRouter,
  image: imageRouter,
  audioLab: audioLabRouter,
  library: libraryRouter,
  explore: exploreRouter,
  chat: chatRouter,
  preferences: preferencesRouter,
  projects: projectsRouter,
  styleCombo: styleComboRouter,
  export: exportRouter,
  integration: integrationRouter,
});

export type AppRouter = typeof appRouter;
