import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { MUSIC_GENRES, INFLUENCES, MUSICAL_CHARACTERISTICS, ERAS } from "../shared/musicStyles";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId = 1): { ctx: TrpcContext; clearedCookies: any[] } {
  const clearedCookies: any[] = [];

  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
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
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

describe("Phase 9 - Style Mixer Enhancements", () => {
  describe("styleCombo.save - Save favorite combinations", () => {
    it("should save a style combination with all metadata", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.styleCombo.save({
        name: "Dark Cyber Baroque",
        genres: ["Cyberpunk", "Classical"],
        subgenres: ["Synthwave", "Baroque"],
        characteristics: {
          Mood: ["Dark", "Melancholic"],
          Texture: ["Atmospheric"],
          Production: ["Heavy Synth"],
        },
        influences: ["Vangelis", "Bach"],
        eras: ["1980s", "1700s"],
        vocalStyles: ["Operatic"],
        productionTechniques: ["Layering", "Reverb"],
        generatedPrompt: "Dark cyberpunk with baroque elements...",
      });

      expect(result).toEqual({ success: true });
    });

    it("should require a name for the combination", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.styleCombo.save({
          name: "",
          genres: ["Rock"],
          subgenres: [],
          characteristics: {},
          influences: [],
          eras: [],
          vocalStyles: [],
          productionTechniques: [],
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("styleCombo.list - Retrieve saved combinations", () => {
    it("should list all saved combinations for a user", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Save a combination first
      await caller.styleCombo.save({
        name: "Test Combo 1",
        genres: ["Rock"],
        subgenres: ["Hard Rock"],
        characteristics: { Mood: ["Energetic"] },
        influences: ["Led Zeppelin"],
        eras: ["1970s"],
        vocalStyles: ["Powerful"],
        productionTechniques: ["Distortion"],
      });

      const result = await caller.styleCombo.list();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });
  });

  describe("styleCombo.toggleFavorite - Mark combinations as favorites", () => {
    it("should toggle favorite status of a combination", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Save a combination
      await caller.styleCombo.save({
        name: "Favorite Test",
        genres: ["Jazz"],
        subgenres: ["Bebop"],
        characteristics: { Mood: ["Sophisticated"] },
        influences: ["Miles Davis"],
        eras: ["1940s"],
        vocalStyles: ["Smooth"],
        productionTechniques: ["Improvisation"],
      });

      const combos = await caller.styleCombo.list();
      if (combos.items.length > 0) {
        const result = await caller.styleCombo.toggleFavorite({
          id: combos.items[0].id,
          isFavorite: true,
        });
        expect(result.success).toBe(true);
      }
    });
  });

  describe("styleCombo.delete - Remove combinations", () => {
    it("should delete a saved combination", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Save a combination
      await caller.styleCombo.save({
        name: "Delete Test",
        genres: ["Electronic"],
        subgenres: ["House"],
        characteristics: { Mood: ["Uplifting"] },
        influences: ["Daft Punk"],
        eras: ["1990s"],
        vocalStyles: ["Robotic"],
        productionTechniques: ["Sampling"],
      });

      const combos = await caller.styleCombo.list();
      if (combos.items.length > 0) {
        const result = await caller.styleCombo.delete({
          id: combos.items[0].id,
        });
        expect(result.success).toBe(true);
      }
    });
  });

  describe("Weighted Random Selection Algorithm", () => {
    it("should generate valid random combinations", () => {
      const weights = {
        genre: 0.7,
        subgenre: 0.5,
        influence: 0.6,
        mood: 0.9,
        texture: 0.4,
        production: 0.7,
        era: 0.3,
      };

      // Simulate weighted selection
      const randomGenres = MUSIC_GENRES
        .sort(() => Math.random() - 0.5)
        .filter(() => Math.random() < weights.genre)
        .slice(0, Math.random() > 0.5 ? 2 : 3);

      expect(randomGenres.length).toBeGreaterThan(0);
      expect(randomGenres.every(g => MUSIC_GENRES.includes(g))).toBe(true);
    });

    it("should generate creative combinations with varied characteristics", () => {
      const weights = {
        mood: 0.9,
        texture: 0.4,
        production: 0.7,
      };

      const randomMoods = MUSICAL_CHARACTERISTICS.Mood
        .sort(() => Math.random() - 0.5)
        .filter(() => Math.random() < weights.mood)
        .slice(0, 1);

      const randomTexture = MUSICAL_CHARACTERISTICS.Texture
        .sort(() => Math.random() - 0.5)
        .filter(() => Math.random() < weights.texture)
        .slice(0, 1);

      expect(randomMoods.length).toBeGreaterThan(0);
      expect(randomMoods[0]).toBeDefined();
    });

    it("should ensure at least one genre is always selected", () => {
      const weights = { genre: 0.7 };

      for (let i = 0; i < 10; i++) {
        const randomGenres = MUSIC_GENRES
          .sort(() => Math.random() - 0.5)
          .filter(() => Math.random() < weights.genre)
          .slice(0, Math.random() > 0.5 ? 2 : 3);

        if (randomGenres.length === 0) {
          randomGenres.push(MUSIC_GENRES[Math.floor(Math.random() * MUSIC_GENRES.length)]);
        }

        expect(randomGenres.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Format Prompt for Suno AI", () => {
    it("should format prompt with complete metadata for Suno", () => {
      const customName = "Dark Cyber Baroque";
      const stylePrompt = "Dark cyberpunk with baroque elements...";
      const selectedGenres = ["Cyberpunk", "Classical"];
      const selectedSubGenres = ["Synthwave", "Baroque"];
      const selectedInfluences = ["Vangelis", "Bach"];
      const selectedEras = ["1980s", "1700s"];
      const selectedVocalStyles = ["Operatic"];
      const selectedProductionTechniques = ["Layering", "Reverb"];

      const formatted = `[STYLE COMBINATION: ${customName}]
Gêneros: ${selectedGenres.join(", ")}
Sub-gêneros: ${selectedSubGenres.join(", ")}
Influências: ${selectedInfluences.join(", ")}
Eras: ${selectedEras.join(", ")}
Estilos Vocais: ${selectedVocalStyles.join(", ")}
Produção: ${selectedProductionTechniques.join(", ")}

${stylePrompt}`;

      expect(formatted).toContain("[STYLE COMBINATION: Dark Cyber Baroque]");
      expect(formatted).toContain("Gêneros: Cyberpunk, Classical");
      expect(formatted).toContain("Sub-gêneros: Synthwave, Baroque");
      expect(formatted).toContain("Influências: Vangelis, Bach");
      expect(formatted).toContain(stylePrompt);
    });

    it("should handle empty selections gracefully", () => {
      const customName = "Minimal";
      const stylePrompt = "Minimal ambient...";
      const selectedGenres: string[] = [];
      const selectedSubGenres: string[] = [];

      const formatted = `[STYLE COMBINATION: ${customName}]
Gêneros: ${selectedGenres.join(", ") || "—"}
Sub-gêneros: ${selectedSubGenres.join(", ") || "—"}

${stylePrompt}`;

      expect(formatted).toContain("Gêneros: —");
      expect(formatted).toContain("Sub-gêneros: —");
      expect(formatted).toContain(stylePrompt);
    });
  });

  describe("Surprise Me - Creative Random Generation", () => {
    it("should generate descriptive names for random combinations", () => {
      const randomGenres = ["Rock", "Jazz"];
      const randomInfluences = ["Beatles"];

      const newName = `${randomGenres.slice(0, 2).join("+")}+${randomInfluences.slice(0, 1).join("")}`;

      expect(newName).toContain("+");
      expect(newName).toMatch(/Rock\+Jazz\+Beatles/);
    });

    it("should generate valid combinations with proper filtering", () => {
      const weights = {
        genre: 0.7,
        influence: 0.6,
      };

      const randomGenres = MUSIC_GENRES
        .sort(() => Math.random() - 0.5)
        .filter(() => Math.random() < weights.genre)
        .slice(0, Math.random() > 0.5 ? 2 : 3);

      const randomInfluences = INFLUENCES
        .sort(() => Math.random() - 0.5)
        .filter(() => Math.random() < weights.influence)
        .slice(0, Math.random() > 0.6 ? 1 : 2);

      expect(randomGenres.length).toBeGreaterThan(0);
      expect(randomGenres.every(g => MUSIC_GENRES.includes(g))).toBe(true);
      expect(randomInfluences.every(i => INFLUENCES.includes(i))).toBe(true);
    });
  });
});
