/**
 * YouTube Data API v3 + Google OAuth2 integration.
 *
 * Requer YOUTUBE_CLIENT_ID e YOUTUBE_CLIENT_SECRET (criados em
 * console.cloud.google.com, com a YouTube Data API v3 habilitada e o
 * redirect URI `<origem>/api/youtube/oauth/callback` autorizado).
 *
 * Não valida upload de vídeo real (binário) — isso é um passo separado
 * que exigiria multipart/resumable upload e um limite de body maior que
 * os 50mb já configurados no Express.
 */
import { ENV } from "./env";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

const SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
].join(" ");

export function getGoogleAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: ENV.youtubeClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

interface TokenResult {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<TokenResult> {
  const params = new URLSearchParams({
    client_id: ENV.youtubeClientId,
    client_secret: ENV.youtubeClientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`Falha ao trocar código por token: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
  const params = new URLSearchParams({
    client_id: ENV.youtubeClientId,
    client_secret: ENV.youtubeClientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`Falha ao renovar token: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return { accessToken: data.access_token, expiresIn: data.expires_in };
}

export function isTokenExpired(expiresAt: Date): boolean {
  // margem de 60s para evitar usar um token que expira durante a request
  return new Date(Date.now() + 60_000) > expiresAt;
}

export interface ChannelStats {
  channelId: string | null;
  channelName: string | null;
  subscribers: number;
  views: number;
  videos: number;
}

export async function getChannelStats(accessToken: string): Promise<ChannelStats> {
  const response = await fetch(`${YOUTUBE_API_BASE}/channels?part=snippet,statistics&mine=true`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar estatísticas do canal: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const channel = data.items?.[0];
  if (!channel) {
    return { channelId: null, channelName: null, subscribers: 0, views: 0, videos: 0 };
  }

  return {
    channelId: channel.id ?? null,
    channelName: channel.snippet?.title ?? null,
    subscribers: Number(channel.statistics?.subscriberCount ?? 0),
    views: Number(channel.statistics?.viewCount ?? 0),
    videos: Number(channel.statistics?.videoCount ?? 0),
  };
}

export interface YoutubeVideoSummary {
  videoId: string;
  title: string;
  thumbnailUrl?: string;
  publishedAt: string;
}

export async function getUserVideos(accessToken: string, maxResults = 10): Promise<YoutubeVideoSummary[]> {
  const channelResponse = await fetch(`${YOUTUBE_API_BASE}/channels?part=contentDetails&mine=true`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!channelResponse.ok) {
    throw new Error(`Falha ao buscar canal: ${channelResponse.status} ${await channelResponse.text()}`);
  }

  const channelData = await channelResponse.json();
  const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) return [];

  const videosResponse = await fetch(
    `${YOUTUBE_API_BASE}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!videosResponse.ok) {
    throw new Error(`Falha ao buscar vídeos: ${videosResponse.status} ${await videosResponse.text()}`);
  }

  const videosData = await videosResponse.json();
  return (videosData.items ?? []).map((item: any) => ({
    videoId: item.snippet?.resourceId?.videoId,
    title: item.snippet?.title,
    thumbnailUrl: item.snippet?.thumbnails?.default?.url,
    publishedAt: item.snippet?.publishedAt,
  }));
}
