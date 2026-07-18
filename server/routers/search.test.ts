import { describe, expect, it } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
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

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("search router", () => {
  it("should search flashcards by query", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.search.flashcards({ query: "suno" });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should search guides by query", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.search.guides({ query: "produção" });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should search all content by query", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.search.all({ query: "youtube" });

    expect(result).toHaveProperty("flashcards");
    expect(result).toHaveProperty("guides");
    expect(Array.isArray(result.flashcards)).toBe(true);
    expect(Array.isArray(result.guides)).toBe(true);
  });

  it("should return empty results for non-matching query", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.search.flashcards({ query: "xyzabc123notfound" });

    expect(result).toEqual([]);
  });

  it("should find guides by title", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.search.guides({ query: "produção" });

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("title");
    expect(result[0]).toHaveProperty("description");
  });
});
