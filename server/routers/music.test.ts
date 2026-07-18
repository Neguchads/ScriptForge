import { describe, expect, it } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

function createAuthContext(): { ctx: TrpcContext } {
  const user = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("music router", () => {
  it("generates music with prompt", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.music.generateMusic({
      prompt: "Upbeat electronic pop song with catchy melody",
      style: "pop",
      duration: "medium",
    });

    expect(result.success).toBe(true);
    expect(result.musicId).toBeDefined();
    expect(result.prompt).toBeDefined();
    expect(result.message).toContain("geração");
  });

  it("lists user musics", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const musics = await caller.music.listMusics({
      limit: 10,
      offset: 0,
      status: "all",
    });

    expect(Array.isArray(musics)).toBe(true);
  });

  it("gets music status", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Primeiro gera uma música
    const generated = await caller.music.generateMusic({
      prompt: "Test music",
      style: "rock",
      duration: "short",
    });

    // Depois obtém o status
    const status = await caller.music.getMusicStatus({
      musicId: generated.musicId,
    });

    expect(status).toBeDefined();
    expect(status?.status).toBeDefined();
  });

  it("deletes music", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Gera uma música
    const generated = await caller.music.generateMusic({
      prompt: "Music to delete",
      style: "jazz",
      duration: "medium",
    });

    // Deleta a música
    const result = await caller.music.deleteMusic({
      musicId: generated.musicId,
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("deletada");
  });
});
