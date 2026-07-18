import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getFlashcardsByCategory, getAllFlashcardCategories } from "../db";

export const recommendationsRouter = router({
  byTheme: publicProcedure
    .input(z.object({ theme: z.string().min(1), limit: z.number().default(5) }))
    .query(async ({ input }) => {
      const categories = await getAllFlashcardCategories();
      
      const themeLower = input.theme.toLowerCase();
      
      // Encontrar categorias relacionadas ao tema
      const relatedCategories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(themeLower) ||
        cat.description?.toLowerCase().includes(themeLower)
      );

      const recommendations: any[] = [];

      // Buscar flashcards das categorias relacionadas
      for (const category of relatedCategories) {
        const flashcards = await getFlashcardsByCategory(category.id);
        recommendations.push(...flashcards.slice(0, input.limit));
      }

      return recommendations.slice(0, input.limit);
    }),

  byNiche: publicProcedure
    .input(z.object({ niche: z.string().min(1), limit: z.number().default(5) }))
    .query(async ({ input }) => {
      const categories = await getAllFlashcardCategories();
      
      const nicheLower = input.niche.toLowerCase();
      
      // Retornar flashcards de todas as categorias (já que todas são relevantes para criadores)
      const recommendations: any[] = [];

      for (const category of categories) {
        const flashcards = await getFlashcardsByCategory(category.id);
        recommendations.push(...flashcards);
      }

      // Filtrar e limitar
      return recommendations.slice(0, input.limit);
    }),

  forScriptTitle: publicProcedure
    .input(z.object({ title: z.string().min(1), limit: z.number().default(5) }))
    .query(async ({ input }) => {
      const categories = await getAllFlashcardCategories();
      
      const titleLower = input.title.toLowerCase();
      
      // Palavras-chave para mapear títulos a categorias
      const keywordMap: Record<string, string[]> = {
        "produção": ["Produção", "Equipamentos"],
        "roteiro": ["Produção", "Análise"],
        "thumbnail": ["Artwork", "Thumbnails"],
        "seo": ["SEO para Música"],
        "música": ["Suno", "Produção Musical", "Monetização"],
        "monetização": ["Monetização YouTube"],
        "crescimento": ["Estratégia de Crescimento"],
        "analytics": ["Análise"],
        "distribuição": ["Distribuição"],
      };

      const matchedCategories: Set<number> = new Set();

      // Encontrar categorias baseado em palavras-chave
      for (const [keyword, categoryNames] of Object.entries(keywordMap)) {
        if (titleLower.includes(keyword)) {
          for (const categoryName of categoryNames) {
            const category = categories.find((c) =>
              c.name.toLowerCase().includes(categoryName.toLowerCase())
            );
            if (category) {
              matchedCategories.add(category.id);
            }
          }
        }
      }

      // Se nenhuma categoria foi encontrada, retornar recomendações gerais
      const categoriesToUse = matchedCategories.size > 0
        ? Array.from(matchedCategories)
        : categories.map((c) => c.id);

      const recommendations: any[] = [];

      for (const categoryId of categoriesToUse) {
        const flashcards = await getFlashcardsByCategory(categoryId);
        recommendations.push(...flashcards);
      }

      return recommendations.slice(0, input.limit);
    }),
});
