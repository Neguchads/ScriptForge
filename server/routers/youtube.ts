import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "../db";
import * as youtubeApi from "../_core/youtubeApi";

async function getValidAccessToken(userId: number): Promise<string> {
  const auth = await db.getYoutubeAuth(userId);
  if (!auth) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Conta do YouTube não conectada" });
  }

  if (auth.expiresAt && youtubeApi.isTokenExpired(auth.expiresAt)) {
    if (!auth.refreshToken) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Token expirado, reconecte sua conta do YouTube" });
    }
    const refreshed = await youtubeApi.refreshAccessToken(auth.refreshToken);
    await db.upsertYoutubeAuth({
      userId,
      accessToken: refreshed.accessToken,
      refreshToken: auth.refreshToken,
      expiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
      channelId: auth.channelId,
      channelName: auth.channelName,
    });
    return refreshed.accessToken;
  }

  return auth.accessToken;
}

export const youtubeRouter = router({
  getAuthUrl: protectedProcedure
    .input(z.object({ redirectUri: z.string().url() }))
    .query(({ input }) => {
      const state = Buffer.from(input.redirectUri, "utf-8").toString("base64");
      return { url: youtubeApi.getGoogleAuthUrl(input.redirectUri, state) };
    }),

  status: protectedProcedure.query(async ({ ctx }) => {
    const auth = await db.getYoutubeAuth(ctx.user.id);
    return {
      connected: !!auth,
      channelId: auth?.channelId ?? null,
      channelName: auth?.channelName ?? null,
    };
  }),

  disconnect: protectedProcedure.mutation(({ ctx }) => db.deleteYoutubeAuth(ctx.user.id)),

  channelStats: protectedProcedure.query(async ({ ctx }) => {
    const accessToken = await getValidAccessToken(ctx.user.id);
    return youtubeApi.getChannelStats(accessToken);
  }),

  videos: protectedProcedure.query(async ({ ctx }) => {
    const accessToken = await getValidAccessToken(ctx.user.id);
    return youtubeApi.getUserVideos(accessToken);
  }),

  uploads: protectedProcedure.query(({ ctx }) => db.getUserYoutubeUploads(ctx.user.id)),
});
