import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { aiMusic, ideas, scripts } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { TRPCError } from "@trpc/server";

/**
 * Router para gerenciar geração de música com IA
 * Integração com Suno Forge para criar e sincronizar músicas
 */
export const musicRouter = router({
  /**
   * Gerar música com IA baseada em prompt
   */
  generateMusic: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(10).max(500),
        style: z.enum(["pop", "rock", "hip-hop", "jazz", "classical", "electronic", "ambient"]).optional(),
        duration: z.enum(["short", "medium", "long"]).default("medium"),
        ideaId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Chamar LLM para melhorar o prompt
        const improvedPrompt = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are a music prompt expert. Enhance the user's music prompt to be more descriptive and suitable for AI music generation. Keep it under 150 words.",
            },
            {
              role: "user",
              content: `Enhance this music prompt: "${input.prompt}". Style: ${input.style || "any"}. Duration: ${input.duration}`,
            },
          ],
        });

        const enhancedPrompt =
          typeof improvedPrompt.choices[0]?.message.content === "string"
            ? improvedPrompt.choices[0].message.content
            : input.prompt;

        // Salvar no banco de dados
        const result = await db.insert(aiMusic).values({
          userId: ctx.user.id,
          prompt: input.prompt,
          enhancedPrompt: enhancedPrompt,
          style: input.style || "pop",
          duration: input.duration,
          status: "generating",
          ideaId: input.ideaId || undefined,
        });

        const musicId = (result as any)[0]?.insertId || 0;

        // Retornar ID para polling
        return {
          success: true,
          musicId,
          prompt: enhancedPrompt,
          message: "Música em geração. Verifique o status em alguns minutos.",
        };
      } catch (error) {
        console.error("Generate music error:", error);
        throw error;
      }
    }),

  /**
   * Obter status de geração de música
   */
  getMusicStatus: protectedProcedure
    .input(z.object({ musicId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return null;

        const music = await db
          .select()
          .from(aiMusic)
          .where(eq(aiMusic.id, input.musicId))
          .limit(1);

        if (!music[0] || music[0].userId !== ctx.user.id) {
          throw new Error("Music not found");
        }

        return {
          id: music[0].id,
          status: music[0].status,
          musicUrl: music[0].musicUrl,
          sunoMusicId: music[0].sunoMusicId,
          error: music[0].error,
          createdAt: music[0].createdAt,
          completedAt: music[0].completedAt,
        };
      } catch (error) {
        console.error("Get music status error:", error);
        return null;
      }
    }),

  /**
   * Listar todas as músicas do usuário
   */
  listMusics: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
        status: z.enum(["all", "generating", "completed", "failed"]).default("all"),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const musics = await db
          .select()
          .from(aiMusic)
          .where(eq(aiMusic.userId, ctx.user.id))
          .then((results) => {
            if (input.status !== "all") {
              return results.filter((m) => m.status === input.status);
            }
            return results;
          })
          .then((results) => results.slice(input.offset, input.offset + input.limit));

        return musics.map((m) => ({
          id: m.id,
          prompt: m.prompt,
          style: m.style,
          duration: m.duration,
          status: m.status,
          musicUrl: m.musicUrl,
          createdAt: m.createdAt,
          completedAt: m.completedAt,
        }));
      } catch (error) {
        console.error("List musics error:", error);
        return [];
      }
    }),

  /**
   * Associar música a uma ideia
   */
  attachMusicToIdea: protectedProcedure
    .input(
      z.object({
        musicId: z.number(),
        ideaId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verificar que a música pertence ao usuário
        const music = await db
          .select()
          .from(aiMusic)
          .where(eq(aiMusic.id, input.musicId))
          .limit(1);

        if (!music[0] || music[0].userId !== ctx.user.id) {
          throw new Error("Music not found");
        }

        // Verificar que a ideia pertence ao usuário
        const idea = await db
          .select()
          .from(ideas)
          .where(eq(ideas.id, input.ideaId))
          .limit(1);

        if (!idea[0] || idea[0].userId !== ctx.user.id) {
          throw new Error("Idea not found");
        }

        // Atualizar ideia com música
        await db
          .update(ideas)
          .set({
            musicGenerationId: input.musicId,
          })
          .where(eq(ideas.id, input.ideaId));

        return {
          success: true,
          message: "Música associada à ideia com sucesso",
        };
      } catch (error) {
        console.error("Attach music to idea error:", error);
        throw error;
      }
    }),

  /**
   * Associar música a um roteiro
   */
  attachMusicToScript: protectedProcedure
    .input(
      z.object({
        musicId: z.number(),
        scriptId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verificar que a música pertence ao usuário
        const music = await db
          .select()
          .from(aiMusic)
          .where(eq(aiMusic.id, input.musicId))
          .limit(1);

        if (!music[0] || music[0].userId !== ctx.user.id) {
          throw new Error("Music not found");
        }

        // Verificar que o roteiro pertence ao usuário
        const script = await db
          .select()
          .from(scripts)
          .where(eq(scripts.id, input.scriptId))
          .limit(1);

        if (!script[0] || script[0].userId !== ctx.user.id) {
          throw new Error("Script not found");
        }

        // Atualizar roteiro com música
        await db
          .update(scripts)
          .set({
            musicGenerationId: input.musicId,
          })
          .where(eq(scripts.id, input.scriptId));

        return {
          success: true,
          message: "Música associada ao roteiro com sucesso",
        };
      } catch (error) {
        console.error("Attach music to script error:", error);
        throw error;
      }
    }),

  /**
   * Deletar música
   */
  deleteMusic: protectedProcedure
    .input(z.object({ musicId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verificar que a música pertence ao usuário
        const music = await db
          .select()
          .from(aiMusic)
          .where(eq(aiMusic.id, input.musicId))
          .limit(1);

        if (!music[0] || music[0].userId !== ctx.user.id) {
          throw new Error("Music not found");
        }

        // Deletar música
        await db.delete(aiMusic).where(eq(aiMusic.id, input.musicId));

        return {
          success: true,
          message: "Música deletada com sucesso",
        };
      } catch (error) {
        console.error("Delete music error:", error);
        throw error;
      }
    }),

  /**
   * Exportar música como MIDI
   */
  exportAsMidi: protectedProcedure
    .input(z.object({ musicId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const music = await db
          .select()
          .from(aiMusic)
          .where(eq(aiMusic.id, input.musicId))
          .limit(1);

        if (!music[0] || music[0].userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // TODO: Implement MIDI export when midiGenerator module is available
        // const { exportMusicAsMidi } = await import("../_core/midiGenerator");
        // const midiBuffer = await exportMusicAsMidi(music[0].id.toString(), {
        //   prompt: music[0].prompt,
        //   style: music[0].style,
        //   tempo: 120,
        // });

        return {
          filename: `${music[0].prompt?.substring(0, 30) || "music"}.mid`,
          data: Buffer.from([]).toString("base64"),
          mimeType: "audio/midi",
        };
      } catch (error) {
        console.error("Export MIDI error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Exportar música como PDF
   */
  exportAsPdf: protectedProcedure
    .input(z.object({ musicId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const music = await db
          .select()
          .from(aiMusic)
          .where(eq(aiMusic.id, input.musicId))
          .limit(1);

        if (!music[0] || music[0].userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // TODO: Implement PDF export when documentGenerator module is available
        // const { exportMusicStyleAsPdf } = await import("../_core/documentGenerator");
        return {
          filename: `${music[0].prompt?.substring(0, 30) || "music"}.pdf`,
          data: Buffer.from("PDF export not yet implemented").toString("base64"),
          mimeType: "application/pdf",
        };
      } catch (error) {
        console.error("Export PDF error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Exportar música como Markdown
   */
  exportAsMarkdown: protectedProcedure
    .input(z.object({ musicId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const music = await db
          .select()
          .from(aiMusic)
          .where(eq(aiMusic.id, input.musicId))
          .limit(1);

        if (!music[0] || music[0].userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // TODO: Implement Markdown export when documentGenerator module is available
        // const { exportMusicStyleAsMarkdown } = await import("../_core/documentGenerator");
        return {
          filename: `${music[0].prompt?.substring(0, 30) || "music"}.md`,
          data: Buffer.from("Markdown export not yet implemented").toString("base64"),
          mimeType: "text/markdown",
        };
      } catch (error) {
        console.error("Export Markdown error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
