import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getAllFlashcardCategories, getFlashcardsByCategory, getAllFlashcards, getUserFlashcardProgress, updateFlashcardProgress } from "../db";

export const flashcardsRouter = router({
  categories: publicProcedure.query(async () => {
    return getAllFlashcardCategories();
  }),

  byCategory: publicProcedure
    .input(z.object({ categoryId: z.number() }))
    .query(async ({ input }) => {
      return getFlashcardsByCategory(input.categoryId);
    }),

  all: publicProcedure.query(async () => {
    return getAllFlashcards();
  }),

  userProgress: protectedProcedure.query(async ({ ctx }) => {
    return getUserFlashcardProgress(ctx.user.id);
  }),

  updateProgress: protectedProcedure
    .input(z.object({
      flashcardId: z.number(),
      learned: z.enum(["not_started", "learning", "learned"]),
    }))
    .mutation(async ({ ctx, input }) => {
      return updateFlashcardProgress(ctx.user.id, input.flashcardId, input.learned);
    }),
});
