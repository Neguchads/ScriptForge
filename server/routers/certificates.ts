import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getUserCertificates, createCertificate, getFlashcardsByCategory, getUserFlashcardProgress } from "../db";
import { nanoid } from "nanoid";

export const certificatesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return getUserCertificates(ctx.user.id);
  }),

  generate: protectedProcedure
    .input(z.object({ categoryId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const flashcards = await getFlashcardsByCategory(input.categoryId);
      const userProgress = await getUserFlashcardProgress(ctx.user.id);

      const completedFlashcards = flashcards.filter((f) =>
        userProgress.some(
          (p) => p.flashcardId === f.id && p.learned === "learned"
        )
      ).length;

      const completionPercentage = Math.round(
        (completedFlashcards / flashcards.length) * 100
      );

      if (completionPercentage < 100) {
        throw new Error("Você precisa completar todos os flashcards para gerar o certificado");
      }

      const certificateCode = `SCRIPTTUBE-${nanoid(10).toUpperCase()}`;

      await createCertificate({
        userId: ctx.user.id,
        categoryId: input.categoryId,
        certificateCode,
        completedFlashcards,
        totalFlashcards: flashcards.length,
        completionPercentage,
        completedAt: new Date(),
      });

      return {
        certificateCode,
        completionPercentage,
        message: "Certificado gerado com sucesso!",
      };
    }),
});
