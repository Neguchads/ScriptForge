import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import * as db from "../db";

export const ideasRouter = router({
  generate: protectedProcedure
    .input(z.object({
      niche: z.string(),
      count: z.number().default(5),
    }))
    .mutation(async ({ ctx, input }) => {
      const prompt = `Gere ${input.count} ideias criativas e originais para vídeos no nicho de "${input.niche}". 
      
      Cada ideia deve ser:
      - Única e engajante
      - Relevante para o nicho
      - Prática de executar
      - Com potencial de viralização
      
      Retorne as ideias em formato JSON como um array de objetos com a estrutura:
      [
        { "title": "Título da ideia", "description": "Descrição breve", "hooks": ["hook1", "hook2"] }
      ]`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system" as const,
            content: "Você é um especialista em criação de conteúdo para YouTube. Gere ideias criativas e originais.",
          },
          {
            role: "user" as const,
            content: prompt,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "video_ideas",
            strict: true,
            schema: {
              type: "object",
              properties: {
                ideas: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      hooks: { type: "array", items: { type: "string" } },
                    },
                    required: ["title", "description", "hooks"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["ideas"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message.content;
      if (!content || typeof content !== 'string') throw new Error("Falha ao gerar ideias");

      const parsed = JSON.parse(content);
      return parsed.ideas;
    }),

  list: protectedProcedure.query(({ ctx }) => db.getUserIdeas(ctx.user.id)),

  create: protectedProcedure
    .input(z.object({
      nicheId: z.number().optional(),
      idea: z.string(),
      source: z.string().optional(),
    }))
    .mutation(({ ctx, input }) =>
      db.createIdea({
        userId: ctx.user.id,
        nicheId: input.nicheId,
        idea: input.idea,
        source: input.source || "manual",
      })
    ),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => db.deleteIdea(input.id)),
});
