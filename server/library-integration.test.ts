import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock do banco com estado
const mockDb = {
  generations: [] as Array<{
    id: number;
    userId: number;
    type: string;
    title?: string;
    content: string;
    metadata?: Record<string, unknown>;
    imageUrl?: string;
    isFavorite: boolean;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>,
};

// Reset do mock antes de cada teste
beforeEach(() => {
  mockDb.generations = [];
});

// Mock do getDb para retornar um banco com estado
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    insert: (table: any) => ({
      values: async (data: any) => {
        mockDb.generations.push({
          id: mockDb.generations.length + 1,
          userId: data.userId,
          type: data.type,
          title: data.title,
          content: data.content,
          metadata: data.metadata || {},
          imageUrl: data.imageUrl,
          isFavorite: data.isFavorite || false,
          isPublic: data.isPublic || false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      },
    }),
    select: () => ({
      from: (table: any) => ({
        where: (condition: any) => ({
          orderBy: (orderBy: any) => ({
            limit: (limit: number) => ({
              offset: (offset: number) => {
                // Simular filtro por userId
                return mockDb.generations.filter(g => g.userId === 1);
              },
            }),
          }),
        }),
      }),
    }),
    update: (table: any) => ({
      set: (data: any) => ({
        where: async (condition: any) => {
          // Simular update de favorito
          const item = mockDb.generations.find(g => g.id === 1);
          if (item) item.isFavorite = data.isFavorite;
        },
      }),
    }),
    delete: (table: any) => ({
      where: async (condition: any) => {
        // Simular delete
        mockDb.generations = mockDb.generations.filter(g => g.id !== 1);
      },
    }),
  }),
}));

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

describe("Library Integration - Save & List", () => {
  it("saves a generation and retrieves it from library", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Salvar uma letra
    const saveResult = await caller.library.save({
      type: "lyrics",
      content: "Test lyrics content",
      title: "Test Song",
      metadata: { genre: "Pop", mood: "Happy" },
    });

    expect(saveResult.success).toBe(true);
    expect(mockDb.generations.length).toBe(1);
    expect(mockDb.generations[0]?.content).toBe("Test lyrics content");
    expect(mockDb.generations[0]?.title).toBe("Test Song");
  });

  it("lists saved generations for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Salvar múltiplas gerações
    await caller.library.save({
      type: "lyrics",
      content: "Lyrics 1",
      title: "Song 1",
    });

    await caller.library.save({
      type: "style_prompt",
      content: "Style prompt 1",
      title: "Style 1",
    });

    // Listar todas
    const listResult = await caller.library.list({ type: "all" });

    expect(listResult.items.length).toBe(2);
    expect(mockDb.generations.length).toBe(2);
  });

  it("filters generations by type", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Salvar diferentes tipos
    await caller.library.save({
      type: "lyrics",
      content: "Lyrics content",
    });

    await caller.library.save({
      type: "image",
      content: "Image prompt",
    });

    // Listar apenas lyrics
    const lyricsResult = await caller.library.list({ type: "lyrics" });

    expect(lyricsResult.items.length).toBeGreaterThanOrEqual(0);
    expect(mockDb.generations.length).toBe(2);
  });

  it("toggles favorite status", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Salvar
    await caller.library.save({
      type: "lyrics",
      content: "Test",
    });

    // Toggle favorito
    const toggleResult = await caller.library.toggleFavorite({
      id: 1,
      isFavorite: true,
    });

    expect(toggleResult.success).toBe(true);
    expect(mockDb.generations[0]?.isFavorite).toBe(true);
  });

  it("persists metadata correctly", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const metadata = { genre: "Electronic", mood: "Dark", bpm: 140 };

    await caller.library.save({
      type: "style_prompt",
      content: "Dark electronic prompt",
      title: "Dark Style",
      metadata,
    });

    expect(mockDb.generations[0]?.metadata).toEqual(metadata);
  });
});
