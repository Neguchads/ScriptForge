import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { generateImage } from "../_core/imageGeneration";

export const thumbnailsRouter = router({
  generate: protectedProcedure
    .input(z.object({
      title: z.string().max(500),
      theme: z.string().max(2000),
      style: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const prompt = `Create a YouTube thumbnail image for a video with the following details:
Title: ${input.title}
Theme: ${input.theme}
${input.style ? `Style: ${input.style}` : "Style: Modern, retro-futuristic with neon colors"}

Requirements:
- Bold, eye-catching design
- Use vibrant colors (cyan, magenta, or contrasting colors)
- Professional quality
- Include visual elements related to the theme`;

        const result = await generateImage({ prompt, width: 1280, height: 720 });

        if (!result.url) {
          throw new Error("Falha ao gerar imagem");
        }

        return { url: result.url };
      } catch (error) {
        console.error("Thumbnail generation error:", error);
        throw new Error("Falha ao gerar thumbnail");
      }
    }),
});
