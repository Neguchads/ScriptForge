import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getAllScriptTemplates, getScriptTemplateById, getScriptTemplatesByType } from "../db";
import { invokeLLM } from "../_core/llm";

export const templatesRouter = router({
  list: publicProcedure.query(async () => {
    const templates = await getAllScriptTemplates();
    return templates;
  }),

  getById: publicProcedure
    .input(z.object({ templateId: z.number() }))
    .query(async ({ input }) => {
      const template = await getScriptTemplateById(input.templateId);
      return template;
    }),

  getByType: publicProcedure
    .input(z.object({ type: z.string() }))
    .query(async ({ input }) => {
      const templates = await getScriptTemplatesByType(input.type);
      return templates;
    }),

  generateWithTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        title: z.string().min(1),
        niche: z.string().min(1),
        targetAudience: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const template = await getScriptTemplateById(input.templateId);
      if (!template) {
        throw new Error("Template not found");
      }

      const structure = JSON.parse(template.structure);

      const prompt = `Você é um roteirista profissional de YouTube especializado em criar roteiros para o nicho "${input.niche}".

Crie um roteiro completo para um vídeo com as seguintes informações:
- Título: ${input.title}
- Nicho: ${input.niche}
- Público-alvo: ${input.targetAudience || "Criadores de conteúdo em geral"}
- Tipo de vídeo: ${template.type}
- Tom: ${template.tone}
- Duração estimada: ${template.estimatedDuration} minutos

Estrutura obrigatória do roteiro:
${JSON.stringify(structure, null, 2)}

Gere um roteiro detalhado seguindo exatamente essa estrutura. Cada seção deve ter 2-3 parágrafos. Seja criativo e envolvente.

Após o roteiro, gere também:
- Título SEO otimizado (máximo 60 caracteres)
- Descrição SEO (máximo 160 caracteres)
- 5 tags relevantes (separadas por vírgula)

Formato de resposta:
ROTEIRO:
[roteiro aqui]

TÍTULO SEO:
[título aqui]

DESCRIÇÃO SEO:
[descrição aqui]

TAGS:
[tags aqui]`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "Você é um especialista em criação de conteúdo para YouTube com experiência em roteirização profissional.",
          },
          { role: "user", content: prompt },
        ],
      });

      const rawContent = response.choices[0]?.message?.content;
      const content = typeof rawContent === 'string' ? rawContent : '';

      // Parse response
      const roteirMatch = content.match(/ROTEIRO:\n([\s\S]*?)(?=\n\nTÍTULO SEO:|$)/);
      const tituloMatch = content.match(/TÍTULO SEO:\n([\s\S]*?)(?=\n\nDESCRIÇÃO SEO:|$)/);
      const descricaoMatch = content.match(/DESCRIÇÃO SEO:\n([\s\S]*?)(?=\n\nTAGS:|$)/);
      const tagsMatch = content.match(/TAGS:\n([\s\S]*?)$/);

      return {
        fullScript: roteirMatch?.[1]?.trim() || content,
        hook: "Veja o roteiro acima",
        introduction: "Introdução incluída no roteiro",
        mainContent: "Conteúdo principal incluído no roteiro",
        callToAction: "CTA incluído no roteiro",
        seoTitle: tituloMatch?.[1]?.trim() || input.title,
        seoDescription: descricaoMatch?.[1]?.trim() || "",
        tags: tagsMatch?.[1]?.trim() || "",
        templateType: template.type,
        templateName: template.name,
      };
    }),
});
