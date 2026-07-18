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

describe("analytics router", () => {
  it("retrieves video analytics", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const analytics = await caller.analytics.getVideoAnalytics();

    expect(Array.isArray(analytics)).toBe(true);
  });

  it("retrieves summary stats", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const summary = await caller.analytics.getSummaryStats();

    expect(summary).toBeDefined();
    expect(summary.totalViews).toBeGreaterThanOrEqual(0);
    expect(summary.totalLikes).toBeGreaterThanOrEqual(0);
  });

  it("updates analytics", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analytics.updateAnalytics({
      youtubeVideoId: "test_video_123",
      title: "Test Video",
      views: 1000,
      likes: 50,
      ctr: "5.2%",
    });

    expect(result.success).toBe(true);
  });
});
