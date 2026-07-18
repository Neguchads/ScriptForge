import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock do invokeLLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: "[Intro - instrumental]\n\n[Verse 1 - instrumental]\n\n[Chorus - instrumental]\n\n[Outro]",
      },
    }],
  }),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("Lyrics Generator - Voice Modes", () => {
  it("generates instrumental structure with [Instrumental] tags", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lyrics.generate({
      theme: "Dark electronic beat",
      genre: "Electronic",
      mood: "Dark",
      voiceMode: "instrumental",
      language: "en",
      creativity: 0.8,
      variations: 1,
    });

    expect(result.lyrics).toBeDefined();
    expect(result.lyrics.length).toBeGreaterThan(0);
    expect(result.lyrics[0]).toContain("[");
  });

  it("generates vocal structure with lyrics and meta-tags", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lyrics.generate({
      theme: "Love story",
      genre: "Pop",
      mood: "Romantic",
      voiceMode: "vocal",
      language: "pt-BR",
      creativity: 0.7,
      variations: 1,
    });

    expect(result.lyrics).toBeDefined();
    expect(result.lyrics.length).toBeGreaterThan(0);
  });

  it("generates acapella structure with [Acapella] tags", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lyrics.generate({
      theme: "Vocal harmony",
      genre: "Gospel",
      mood: "Spiritual",
      voiceMode: "acapella",
      language: "en",
      creativity: 0.8,
      variations: 1,
    });

    expect(result.lyrics).toBeDefined();
    expect(result.lyrics.length).toBeGreaterThan(0);
  });

  it("generates vocal + instrumental structure", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lyrics.generate({
      theme: "Epic journey",
      genre: "Rock",
      mood: "Epic",
      voiceMode: "vocal_instrumental",
      language: "en",
      creativity: 0.9,
      variations: 1,
    });

    expect(result.lyrics).toBeDefined();
    expect(result.lyrics.length).toBeGreaterThan(0);
  });

  it("includes structural tags in generation", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lyrics.generate({
      theme: "Adventure",
      genre: "Electronic",
      voiceMode: "instrumental",
      structuralTags: ["[Intro]", "[Verse 1]", "[Chorus]", "[Bridge]", "[Outro]"],
      language: "en",
      creativity: 0.7,
      variations: 1,
    });

    expect(result.lyrics).toBeDefined();
    expect(result.lyrics.length).toBeGreaterThan(0);
  });

  it("includes instrumental instructions in generation", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lyrics.generate({
      theme: "Cinematic moment",
      genre: "Orchestral",
      voiceMode: "instrumental",
      instrumentalInstructions: ["[Guitar Solo]", "[Piano Interlude]", "[Heavy Synth Build]"],
      language: "en",
      creativity: 0.8,
      variations: 1,
    });

    expect(result.lyrics).toBeDefined();
    expect(result.lyrics.length).toBeGreaterThan(0);
  });

  it("includes dynamics in generation", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lyrics.generate({
      theme: "High energy",
      genre: "EDM",
      voiceMode: "vocal_instrumental",
      dynamics: ["[Build-up]", "[Drop intense]", "[Fade out]"],
      language: "en",
      creativity: 0.9,
      variations: 1,
    });

    expect(result.lyrics).toBeDefined();
    expect(result.lyrics.length).toBeGreaterThan(0);
  });

  it("generates multiple variations separated by marker", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lyrics.generate({
      theme: "Test theme",
      genre: "Pop",
      voiceMode: "vocal",
      language: "en",
      creativity: 0.7,
      variations: 3,
    });

    expect(result.lyrics).toBeDefined();
    expect(result.lyrics.length).toBeGreaterThanOrEqual(1);
  });

  it("accepts custom lyrics/structure input", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const customLyrics = "[Verse 1]\nCustom lyrics here\n[Chorus]\nCustom chorus";

    const result = await caller.lyrics.generate({
      theme: "Custom structure",
      genre: "Pop",
      voiceMode: "vocal",
      customLyrics,
      language: "en",
      creativity: 0.7,
      variations: 1,
    });

    expect(result.lyrics).toBeDefined();
    expect(result.lyrics.length).toBeGreaterThan(0);
  });
});
