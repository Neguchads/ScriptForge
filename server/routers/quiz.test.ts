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

describe("quiz router", () => {
  it("submits quiz attempt and updates score", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.quiz.submitQuizAttempt({
      categoryId: 1,
      score: 8,
      totalQuestions: 10,
    });

    expect(result.success).toBe(true);
    expect(result.points).toBeGreaterThan(0);
    expect(result.badge).toBeDefined();
  });

  it("retrieves user score", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const score = await caller.quiz.getUserScore();

    expect(score).toBeDefined();
  });

  it("retrieves leaderboard", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const leaderboard = await caller.quiz.getLeaderboard();

    expect(Array.isArray(leaderboard)).toBe(true);
  });
});
