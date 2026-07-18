import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { invokeLLM } from "./_core/llm";

// ─── Mock LLM ────────────────────────────────────────────────────────────────
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            stylePrompt: "dark electronic, heavy bass, 140 BPM",
            tags: ["dark electronic", "heavy bass", "140 BPM"],
            explanation: "A dark electronic style with heavy bass.",
          }),
        },
      },
    ],
  }),
}));

// ─── Mock Image Generation ────────────────────────────────────────────────────
vi.mock("./_core/imageGeneration", () => ({
  generateImage: vi.fn().mockResolvedValue({ url: "https://example.com/image.png" }),
}));

// ─── Mock DB ──────────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

// ─── Context helpers ──────────────────────────────────────────────────────────
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user-1",
      email: "test@sunoforge.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Auth Tests ───────────────────────────────────────────────────────────────
describe("auth", () => {
  it("me returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("me returns user for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.email).toBe("test@sunoforge.com");
  });

  it("logout clears cookie and returns success", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(ctx.res.clearCookie).toHaveBeenCalledOnce();
  });
});

const mockInvokeLLM = vi.mocked(invokeLLM);

// ─── Lyrics Tests ─────────────────────────────────────────────────────────────

describe("lyrics.generate", () => {
  beforeEach(() => {
    mockInvokeLLM.mockResolvedValue({
      choices: [{ message: { content: "[Verse 1]\nTest lyrics\n\n[Chorus]\nTest chorus" } }],
    } as any);
  });

  it("generates lyrics with valid input", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.lyrics.generate({
      theme: "A love story in the rain",
      genre: "Pop",
      mood: "Romantic",
      language: "pt-BR",
      creativity: 0.7,
      variations: 1,
    });
    expect(result).toHaveProperty("lyrics");
    expect(Array.isArray(result.lyrics)).toBe(true);
    expect(result.lyrics.length).toBeGreaterThan(0);
  });

  it("generates multiple variations when requested", async () => {
    mockInvokeLLM.mockResolvedValue({
      choices: [{ message: { content: "Variation 1\n---VARIATION---\nVariation 2\n---VARIATION---\nVariation 3" } }],
    });

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.lyrics.generate({
      theme: "Night city",
      genre: "Electronic",
      language: "en",
      creativity: 0.8,
      variations: 3,
    });
    expect(result.lyrics.length).toBe(3);
  });
});

// ─── Style Tests ───────────────────────────────────────────────────────────────
describe("style.generate", () => {
  beforeEach(() => {
    mockInvokeLLM.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ stylePrompt: "dark electronic, heavy bass, 140 BPM", tags: ["dark electronic", "heavy bass"], explanation: "A dark style." }) } }],
    } as any);
  });

  it("generates style prompt with valid input", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.style.generate({
      genre: "Electronic",
      mood: "Dark",
      instruments: ["synthesizer", "bass"],
      mode: "professional",
    });
    expect(result).toHaveProperty("stylePrompt");
    expect(result).toHaveProperty("tags");
    expect(result).toHaveProperty("explanation");
    expect(Array.isArray(result.tags)).toBe(true);
  });
});

// ─── Image Tests ──────────────────────────────────────────────────────────────
describe("image.generate", () => {
  it("generates image with valid prompt", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.image.generate({
      prompt: "A dark cyberpunk album cover with neon lights",
      style: "Cyberpunk neon",
      genre: "Electronic",
      mood: "Dark",
    });
    expect(result).toHaveProperty("url");
    expect(typeof result.url).toBe("string");
  });
});

// ─── Library Tests ────────────────────────────────────────────────────────────
describe("library", () => {
  it("save requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.library.save({
        type: "lyrics",
        content: "Test lyrics",
        title: "Test",
      })
    ).rejects.toThrow();
  });

  it("list requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.library.list({ type: "all" })).rejects.toThrow();
  });
});

// ─── Preferences Tests ────────────────────────────────────────────────────────
describe("preferences", () => {
  it("get requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.preferences.get()).rejects.toThrow();
  });

  it("save requires authentication", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.preferences.save({ favoriteGenre: "Pop" })
    ).rejects.toThrow();
  });
});

// ─── Explore Tests ────────────────────────────────────────────────────────────
describe("explore.list", () => {
  it("returns empty list when db is unavailable", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.explore.list({ limit: 10 });
    expect(result).toHaveProperty("items");
    expect(Array.isArray(result.items)).toBe(true);
  });
});

// ─── Chat Tests ───────────────────────────────────────────────────────────────
describe("chat.send", () => {
  beforeEach(() => {
    mockInvokeLLM.mockResolvedValue({
      choices: [{ message: { content: "Here is how to create a great Suno AI prompt..." } }],
    } as any);
  });

  it("sends message and returns reply", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.chat.send({
      message: "How do I create a good Suno AI prompt?",
      history: [],
    });
    expect(result).toHaveProperty("reply");
    expect(typeof result.reply).toBe("string");
    expect(result.reply.length).toBeGreaterThan(0);
  });
});
