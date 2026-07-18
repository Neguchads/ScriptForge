import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import * as db from "../db";

export const scriptsRouter = router({
  generate: protectedProcedure
    .input(z.object({
      title: z.string(),
      niche: z.string(),
      targetAudience: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const prompt = `Crie um roteiro completo para um vídeo do YouTube com o seguinte tema:

Título: ${input.title}
Nicho: ${input.niche}
${input.targetAudience ? `Público-alvo: ${input.targetAudience}` : ""}

O roteiro deve ter a seguinte estrutura em JSON:
{
  "hook": "Uma frase de impacto para os primeiros 3 segundos",
  "introduction": "Introdução engajante (2-3 parágrafos)",
  "mainContent": "Conteúdo principal estruturado em seções (5-7 parágrafos)",
  "callToAction": "Call to action claro e direto",
  "seoTitle": "Título otimizado para SEO (60 caracteres)",
  "seoDescription": "Descrição otimizada para SEO (160 caracteres)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Certifique-se de que:
- O hook seja impactante e retenha a atenção
- O conteúdo seja informativo e bem estruturado
- O CTA seja persuasivo
- Os metadados SEO sejam otimizados
- As tags sejam relevantes e populares`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system" as const,
            content: "Você é um especialista em criação de roteiros para YouTube. Crie roteiros estruturados, engajantes e otimizados para SEO.",
          },
          {
            role: "user" as const,
            content: prompt,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "video_script",
            strict: true,
            schema: {
              type: "object",
              properties: {
                hook: { type: "string" },
                introduction: { type: "string" },
                mainContent: { type: "string" },
                callToAction: { type: "string" },
                seoTitle: { type: "string" },
                seoDescription: { type: "string" },
                tags: { type: "array", items: { type: "string" } },
              },
              required: ["hook", "introduction", "mainContent", "callToAction", "seoTitle", "seoDescription", "tags"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message.content;
      if (!content || typeof content !== 'string') throw new Error("Falha ao gerar roteiro");

      const parsed = JSON.parse(content);
      const fullScript = `${parsed.hook}\n\n${parsed.introduction}\n\n${parsed.mainContent}\n\n${parsed.callToAction}`;

      return {
        ...parsed,
        fullScript,
        tags: JSON.stringify(parsed.tags),
      };
    }),

  list: protectedProcedure.query(({ ctx }) => db.getUserScripts(ctx.user.id)),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => db.getScriptById(input.id)),

  create: protectedProcedure
    .input(z.object({
      nicheId: z.number().optional(),
      title: z.string(),
      hook: z.string().optional(),
      introduction: z.string().optional(),
      mainContent: z.string().optional(),
      callToAction: z.string().optional(),
      fullScript: z.string().optional(),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      tags: z.string().optional(),
      thumbnailPrompt: z.string().optional(),
      thumbnailUrl: z.string().optional(),
    }))
    .mutation(({ ctx, input }) =>
      db.createScript({ userId: ctx.user.id, ...input })
    ),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      nicheId: z.number().optional(),
      title: z.string().optional(),
      hook: z.string().optional(),
      introduction: z.string().optional(),
      mainContent: z.string().optional(),
      callToAction: z.string().optional(),
      fullScript: z.string().optional(),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      tags: z.string().optional(),
      thumbnailPrompt: z.string().optional(),
      thumbnailUrl: z.string().optional(),
    }))
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateScript(id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => db.deleteScript(input.id)),
});
