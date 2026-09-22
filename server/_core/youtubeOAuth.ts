import type { Express, Request, Response } from "express";
import * as db from "../db";
import * as youtubeApi from "./youtubeApi";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerYoutubeOAuthRoutes(app: Express) {
  app.get("/api/youtube/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).send("code e state são obrigatórios");
      return;
    }

    try {
      const user = await sdk.authenticateRequest(req);
      const redirectUri = Buffer.from(state, "base64").toString("utf-8");

      const tokens = await youtubeApi.exchangeCodeForTokens(code, redirectUri);
      const stats = await youtubeApi.getChannelStats(tokens.accessToken);

      await db.upsertYoutubeAuth({
        userId: user.id,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken ?? null,
        expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
        channelId: stats.channelId,
        channelName: stats.channelName,
      });

      res.redirect(302, "/youtube?connected=1");
    } catch (error) {
      console.error("[YouTube OAuth] Callback failed", error);
      res.redirect(302, "/youtube?error=1");
    }
  });
}
