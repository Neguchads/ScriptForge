import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
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
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("flashcards router", () => {
  it("should get all flashcard categories", async () => {
    const caller = appRouter.createCaller({} as any);
    const categories = await caller.flashcards.categories();
    
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0]).toHaveProperty("id");
    expect(categories[0]).toHaveProperty("name");
  });

  it("should get flashcards by category", async () => {
    const caller = appRouter.createCaller({} as any);
    const flashcards = await caller.flashcards.byCategory({ categoryId: 1 });
    
    expect(Array.isArray(flashcards)).toBe(true);
    if (flashcards.length > 0) {
      expect(flashcards[0]).toHaveProperty("question");
      expect(flashcards[0]).toHaveProperty("answer");
      expect(flashcards[0]).toHaveProperty("difficulty");
    }
  });

  it("should get all flashcards", async () => {
    const caller = appRouter.createCaller({} as any);
    const flashcards = await caller.flashcards.all();
    
    expect(Array.isArray(flashcards)).toBe(true);
    expect(flashcards.length).toBeGreaterThan(0);
  });

  it("should get user flashcard progress", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const progress = await caller.flashcards.userProgress();
    
    expect(Array.isArray(progress)).toBe(true);
  });

  it("should update flashcard progress", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    // Get a flashcard first
    const flashcards = await appRouter.createCaller({} as any).flashcards.all();
    if (flashcards.length > 0) {
      const result = await caller.flashcards.updateProgress({
        flashcardId: flashcards[0].id,
        learned: "learning",
      });
      
      expect(result).toBeDefined();
    }
  });
});
