import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { quizAttempts, quizScores } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const quizRouter = router({
  getLeaderboard: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const scores = await db
      .select()
      .from(quizScores)
      .orderBy(desc(quizScores.totalPoints))
      .limit(10);

    return scores;
  }),

  getUserScore: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const score = await db
      .select()
      .from(quizScores)
      .where(eq(quizScores.userId, ctx.user.id))
      .limit(1);

    return score[0] || null;
  }),

  submitQuizAttempt: protectedProcedure
    .input(
      z.object({
        categoryId: z.number(),
        score: z.number(),
        totalQuestions: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Insert quiz attempt
      await db.insert(quizAttempts).values({
        userId: ctx.user.id,
        categoryId: input.categoryId,
        score: input.score,
        totalQuestions: input.totalQuestions,
      });

      // Update or create quiz score
      const existingScore = await db
        .select()
        .from(quizScores)
        .where(eq(quizScores.userId, ctx.user.id))
        .limit(1);

      const points = Math.floor((input.score / input.totalQuestions) * 100);
      let badge = "Iniciante";
      if (points >= 80) badge = "Especialista";
      else if (points >= 60) badge = "Intermediário";

      if (existingScore.length > 0) {
        await db
          .update(quizScores)
          .set({
            totalPoints: existingScore[0].totalPoints + points,
            quizzesCompleted: existingScore[0].quizzesCompleted + 1,
            badge,
          })
          .where(eq(quizScores.userId, ctx.user.id));
      } else {
        await db.insert(quizScores).values({
          userId: ctx.user.id,
          totalPoints: points,
          quizzesCompleted: 1,
          badge,
        });
      }

      return { success: true, points, badge };
    }),

  getAttempts: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const attempts = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, ctx.user.id))
      .orderBy(desc(quizAttempts.completedAt));

    return attempts;
  }),

  startQuiz: protectedProcedure
    .input(z.object({ categoryId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Create a new quiz attempt
      const result = await db.insert(quizAttempts).values({
        userId: ctx.user.id,
        categoryId: input.categoryId,
        score: 0,
        totalQuestions: 0,
      });

      return { success: true, attemptId: 1 };
    }),

  submitAnswer: protectedProcedure
    .input(
      z.object({
        attemptId: z.number(),
        questionId: z.number(),
        isCorrect: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // This procedure records individual answers
      // In a real implementation, you would store these in a separate table
      return { success: true, recorded: true };
    }),
});
