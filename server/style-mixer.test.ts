import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock do invokeLLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          stylePrompt: "Dark lo-fi baroque: melancholic piano with vintage vinyl crackle, baroque harpsichord elements, introspective mood, lo-fi production, 60-80 BPM",
          tags: ["dark", "lo-fi", "baroque", "melancholic", "vintage", "piano"],
          explanation: "This combination blends baroque classical elements with lo-fi hip-hop aesthetics, creating a unique introspective sound with vintage warmth.",
        }),
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

describe("Style Mixer - Infinite Combinations", () => {
  it("generates dark+lo-fi+baroque combination", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.style.generate({
      genre: "Electronic, Classical",
      subgenre: "Lo-Fi, Baroque",
      mood: "Dark, Melancholic, Introspective",
      production: "Lo-Fi, Vintage",
      era: "1600s, 2020s",
    });

    expect(result.stylePrompt).toBeDefined();
    expect(result.tags).toBeDefined();
    expect(result.tags.length).toBeGreaterThan(0);
    expect(result.explanation).toBeDefined();
  });

  it("generates cyber+techno+electronic+dark combination", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.style.generate({
      genre: "Electronic, Techno",
      subgenre: "Cyberpunk, Darksynth",
      mood: "Dark, Energetic, Mysterious",
      production: "Digital, Distorted, Modern",
      era: "2020s, Futuristic",
    });

    expect(result.stylePrompt).toBeDefined();
    expect(result.tags).toBeDefined();
    expect(result.explanation).toBeDefined();
  });

  it("generates vaporwave+synthpop+nostalgic combination", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.style.generate({
      genre: "Electronic, Pop",
      subgenre: "Vaporwave, Synthpop",
      mood: "Nostalgic, Ethereal, Psychedelic",
      production: "Vintage, Reverb-Heavy",
      era: "1980s, Retro-Futuristic",
    });

    expect(result.stylePrompt).toBeDefined();
    expect(result.tags).toBeDefined();
    expect(result.explanation).toBeDefined();
  });

  it("generates darkwave+post-punk+industrial combination", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.style.generate({
      genre: "Rock, Electronic",
      subgenre: "Darkwave, Post-Punk, Industrial",
      mood: "Dark, Aggressive, Mysterious",
      production: "Distorted, Compressed",
      vocalStyle: "Breathy, Powerful",
    });

    expect(result.stylePrompt).toBeDefined();
    expect(result.tags).toBeDefined();
    expect(result.explanation).toBeDefined();
  });

  it("generates lo-fi hip-hop chill combination", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.style.generate({
      genre: "Hip-Hop, Electronic",
      subgenre: "Lo-Fi, Chillwave",
      mood: "Relaxing, Nostalgic, Melancholic",
      production: "Lo-Fi, Analog",
      bpm: 85,
    });

    expect(result.stylePrompt).toBeDefined();
    expect(result.tags).toBeDefined();
    expect(result.explanation).toBeDefined();
  });

  it("generates orchestral cinematic epic combination", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.style.generate({
      genre: "Classical, Orchestral",
      subgenre: "Cinematic, Epic",
      mood: "Epic, Cinematic, Motivational",
      production: "Hi-Fi, Dynamic",
      instruments: ["Strings", "Brass", "Woodwinds"],
    });

    expect(result.stylePrompt).toBeDefined();
    expect(result.tags).toBeDefined();
    expect(result.explanation).toBeDefined();
  });

  it("generates ambient dark drone combination", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.style.generate({
      genre: "Ambient, Electronic",
      subgenre: "Dark Ambient, Drone",
      mood: "Dark, Mysterious, Eerie",
      production: "Reverb-Heavy, Spacious",
      bpm: 50,
    });

    expect(result.stylePrompt).toBeDefined();
    expect(result.tags).toBeDefined();
    expect(result.explanation).toBeDefined();
  });

  it("generates synthwave retrowave cyberpunk combination", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.style.generate({
      genre: "Electronic, Synthwave",
      subgenre: "Retrowave, Cyberpunk",
      mood: "Nostalgic, Energetic, Mysterious",
      production: "Vintage, Modern, Reverb-Heavy",
      era: "1980s, 2020s",
    });

    expect(result.stylePrompt).toBeDefined();
    expect(result.tags).toBeDefined();
    expect(result.explanation).toBeDefined();
  });

  it("generates glitch IDM experimental combination", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.style.generate({
      genre: "Electronic, Experimental",
      subgenre: "Glitch, IDM",
      mood: "Chaotic, Mysterious, Psychedelic",
      production: "Bitcrushed, Digital",
    });

    expect(result.stylePrompt).toBeDefined();
    expect(result.tags).toBeDefined();
    expect(result.explanation).toBeDefined();
  });

  it("generates baroque classical minimalist combination", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.style.generate({
      genre: "Classical, Minimalist",
      subgenre: "Baroque, Neoclassical",
      mood: "Introspective, Serene, Ethereal",
      production: "Hi-Fi, Clean",
      era: "1600s, Contemporary",
    });

    expect(result.stylePrompt).toBeDefined();
    expect(result.tags).toBeDefined();
    expect(result.explanation).toBeDefined();
  });

  it("handles multiple genres seamlessly", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.style.generate({
      genre: "Rock, Electronic, Jazz, Classical",
      subgenre: "Progressive Rock, Synthwave, Fusion, Baroque",
      mood: "Epic, Dark, Mysterious, Energetic",
      production: "Modern, Vintage, Experimental",
    });

    expect(result.stylePrompt).toBeDefined();
    expect(result.tags).toBeDefined();
    expect(result.explanation).toBeDefined();
    expect(result.explanation).toContain("blend");
  });

  it("returns tags array with multiple elements", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.style.generate({
      genre: "Electronic",
      subgenre: "Synthwave, Darksynth",
      mood: "Dark, Energetic",
    });

    expect(Array.isArray(result.tags)).toBe(true);
    expect(result.tags.length).toBeGreaterThan(0);
    expect(result.tags.every(tag => typeof tag === "string")).toBe(true);
  });
});
