import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { eq, and } from "drizzle-orm";
import { generations, exports } from "../drizzle/schema";
import {
  generatePDF,
  generateMIDI,
  generateJSON,
  generateShareToken,
  generateShareURL,
  generateEmbedCode,
  parseLyricsStructure,
} from "./export-helpers";

export const exportRouter = router({
  /**
   * Export generation as PDF
   */
  exportPDF: protectedProcedure
    .input(
      z.object({
        generationId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const generation = await db
        .select()
        .from(generations)
        .where(
          and(
            eq(generations.id, input.generationId),
            eq(generations.userId, ctx.user!.id)
          )
        )
        .limit(1);

      if (!generation.length) {
        throw new Error("Generation not found or unauthorized");
      }

      const pdfBuffer = await generatePDF(generation[0]);
      const shareToken = generateShareToken();

      // Save export record
      await db.insert(exports).values({
        userId: ctx.user!.id,
        generationId: input.generationId,
        shareToken,
        exportType: "pdf",
        title: generation[0].title || "Untitled Export",
        description: `PDF export of ${generation[0].type}`,
      });

      return {
        success: true,
        shareToken,
        shareUrl: generateShareURL(shareToken),
        embedCode: generateEmbedCode(shareToken, generation[0].title || "Export"),
      };
    }),

  /**
   * Export generation as MIDI
   */
  exportMIDI: protectedProcedure
    .input(
      z.object({
        generationId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const generation = await db
        .select()
        .from(generations)
        .where(
          and(
            eq(generations.id, input.generationId),
            eq(generations.userId, ctx.user!.id)
          )
        )
        .limit(1);

      if (!generation.length) {
        throw new Error("Generation not found or unauthorized");
      }

      const midiBuffer = generateMIDI(generation[0]);
      const shareToken = generateShareToken();

      // Save export record
      await db.insert(exports).values({
        userId: ctx.user!.id,
        generationId: input.generationId,
        shareToken,
        exportType: "midi",
        title: generation[0].title || "Untitled Export",
        description: `MIDI export of ${generation[0].type}`,
      });

      return {
        success: true,
        shareToken,
        shareUrl: generateShareURL(shareToken),
        midiStructure: parseLyricsStructure(generation[0].content || ""),
      };
    }),

  /**
   * Export generation as JSON
   */
  exportJSON: protectedProcedure
    .input(
      z.object({
        generationId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const generation = await db
        .select()
        .from(generations)
        .where(
          and(
            eq(generations.id, input.generationId),
            eq(generations.userId, ctx.user!.id)
          )
        )
        .limit(1);

      if (!generation.length) {
        throw new Error("Generation not found or unauthorized");
      }

      const jsonBuffer = generateJSON(generation[0]);
      const shareToken = generateShareToken();

      // Save export record
      await db.insert(exports).values({
        userId: ctx.user!.id,
        generationId: input.generationId,
        shareToken,
        exportType: "json",
        title: generation[0].title || "Untitled Export",
        description: `JSON export of ${generation[0].type}`,
      });

      return {
        success: true,
        shareToken,
        shareUrl: generateShareURL(shareToken),
        jsonData: JSON.parse(jsonBuffer.toString()),
      };
    }),

  /**
   * Create shareable link for generation
   */
  createShareLink: protectedProcedure
    .input(
      z.object({
        generationId: z.number(),
        expiresInDays: z.number().optional().default(30),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const generation = await db
        .select()
        .from(generations)
        .where(
          and(
            eq(generations.id, input.generationId),
            eq(generations.userId, ctx.user!.id)
          )
        )
        .limit(1);

      if (!generation.length) {
        throw new Error("Generation not found or unauthorized");
      }

      const shareToken = generateShareToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);

      await db.insert(exports).values({
        userId: ctx.user!.id,
        generationId: input.generationId,
        shareToken,
        exportType: "embed",
        title: generation[0].title || "Untitled Export",
        description: `Share link for ${generation[0].type}`,
        expiresAt,
      });

      return {
        success: true,
        shareToken,
        shareUrl: generateShareURL(shareToken),
        embedCode: generateEmbedCode(shareToken, generation[0].title || "Export"),
        expiresAt: expiresAt.toISOString(),
      };
    }),

  /**
   * Get all exports for user
   */
  listExports: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const userExports = await db
      .select()
      .from(exports)
      .where(eq(exports.userId, ctx.user!.id));

    return userExports;
  }),

  /**
   * Delete export
   */
  deleteExport: protectedProcedure
    .input(z.object({ exportId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const exportRecord = await db
        .select()
        .from(exports)
        .where(eq(exports.id, input.exportId))
        .limit(1);

      if (!exportRecord.length || exportRecord[0].userId !== ctx.user!.id) {
        throw new Error("Export not found or unauthorized");
      }

      await db.delete(exports).where(eq(exports.id, input.exportId));

      return { success: true };
    }),

  /**
   * Get export by share token (public)
   */
  getPublicExport: protectedProcedure
    .input(z.object({ shareToken: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const exportRecord = await db
        .select()
        .from(exports)
        .where(eq(exports.shareToken, input.shareToken))
        .limit(1);

      if (!exportRecord.length) return null;

      const exp = exportRecord[0];

      // Check expiration
      if (exp.expiresAt && new Date(exp.expiresAt) < new Date()) {
        return null;
      }

      // Increment view count
      await db
        .update(exports)
        .set({ viewCount: (exp.viewCount || 0) + 1 })
        .where(eq(exports.id, exp.id));

      // Get generation data
      const generation = await db
        .select()
        .from(generations)
        .where(eq(generations.id, exp.generationId))
        .limit(1);

      return {
        export: exp,
        generation: generation[0] || null,
      };
    }),
});
