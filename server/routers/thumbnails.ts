import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { generateImage } from "../_core/imageGeneration";
import { storagePut } from "../storage";

export const thumbnailsRouter = router({
  generate: protectedProcedure
    .input(z.object({
      title: z.string(),
      theme: z.string(),
      style: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const prompt = `Create a YouTube thumbnail image for a video with the following details:
Title: ${input.title}
Theme: ${input.theme}
${input.style ? `Style: ${input.style}` : "Style: Modern, retro-futuristic with neon colors"}

Requirements:
- Bold, eye-catching design
- Text should be large and readable
- Use vibrant colors (cyan, magenta, or contrasting colors)
- Professional quality
- 1280x720 pixels aspect ratio
- Include visual elements related to the theme`;

        const result = await generateImage({
          prompt,
        });

        if (!result.url) {
          throw new Error("Falha ao gerar imagem");
        }

        // Upload to storage
        const response = await fetch(result.url);
        const buffer = await response.arrayBuffer();
        
        const storageResult = await storagePut(
          `thumbnails/${ctx.user.id}/${Date.now()}.png`,
          Buffer.from(buffer),
          "image/png"
        );

        return {
          url: storageResult.url,
          key: storageResult.key,
        };
      } catch (error) {
        console.error("Thumbnail generation error:", error);
        throw new Error("Falha ao gerar thumbnail");
      }
    }),
});
