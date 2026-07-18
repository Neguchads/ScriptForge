import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { searchFlashcards, addSearchHistory } from "../db";

export const searchRouter = router({
  flashcards: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const results = await searchFlashcards(input.query);
      
      if (ctx.user) {
        await addSearchHistory({
          userId: ctx.user.id,
          query: input.query,
          resultCount: results.length,
          searchType: "flashcard",
        });
      }
      
      return results;
    }),

  guides: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const guides = [
        { title: "Pré-Produção", description: "Planejamento, pesquisa e preparação antes de gravar" },
        { title: "Produção", description: "Gravação e captura de conteúdo" },
        { title: "Pós-Produção", description: "Edição, efeitos e finalização" },
        { title: "SEO & Publicação", description: "Otimização para descoberta e publicação" },
        { title: "Promoção", description: "Estratégias para aumentar views e engajamento" },
      ];

      const queryLower = input.query.toLowerCase();
      const results = guides.filter(
        (guide) =>
          guide.title.toLowerCase().includes(queryLower) ||
          guide.description.toLowerCase().includes(queryLower)
      );

      if (ctx.user) {
        await addSearchHistory({
          userId: ctx.user.id,
          query: input.query,
          resultCount: results.length,
          searchType: "guide",
        });
      }

      return results;
    }),

  all: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const flashcardResults = await searchFlashcards(input.query);
      
      const guides = [
        { title: "Pré-Produção", description: "Planejamento, pesquisa e preparação antes de gravar" },
        { title: "Produção", description: "Gravação e captura de conteúdo" },
        { title: "Pós-Produção", description: "Edição, efeitos e finalização" },
        { title: "SEO & Publicação", description: "Otimização para descoberta e publicação" },
        { title: "Promoção", description: "Estratégias para aumentar views e engajamento" },
      ];

      const queryLower = input.query.toLowerCase();
      const guideResults = guides.filter(
        (guide) =>
          guide.title.toLowerCase().includes(queryLower) ||
          guide.description.toLowerCase().includes(queryLower)
      );

      if (ctx.user) {
        await addSearchHistory({
          userId: ctx.user.id,
          query: input.query,
          resultCount: flashcardResults.length + guideResults.length,
          searchType: "all",
        });
      }

      return {
        flashcards: flashcardResults,
        guides: guideResults,
      };
    }),
});
