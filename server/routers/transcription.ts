import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { transcribeAudio } from "../_core/voiceTranscription";

export const transcriptionRouter = router({
  transcribe: protectedProcedure
    .input(z.object({
      audioUrl: z.string().url(),
      language: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await transcribeAudio({
          audioUrl: input.audioUrl,
          language: input.language || "pt",
          prompt: "Transcrição de ideias para vídeos do YouTube",
        });

        if ('error' in result) {
          throw new Error(result.error);
        }

        return {
          text: result.text,
          language: result.language,
        };
      } catch (error) {
        console.error("Transcription error:", error);
        throw new Error("Falha ao transcrever áudio");
      }
    }),
});
