import { describe, expect, it, vi } from "vitest";
import { ideasRouter } from "./ideas";
import type { TrpcContext } from "../_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

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

describe("ideas router", () => {
  it("should have list procedure", async () => {
    const ctx = createAuthContext();
    const caller = ideasRouter.createCaller(ctx);
    
    expect(caller.list).toBeDefined();
  });

  it("should have create procedure", async () => {
    const ctx = createAuthContext();
    const caller = ideasRouter.createCaller(ctx);
    
    expect(caller.create).toBeDefined();
  });

  it("should have delete procedure", async () => {
    const ctx = createAuthContext();
    const caller = ideasRouter.createCaller(ctx);
    
    expect(caller.delete).toBeDefined();
  });

  it("should have generate procedure", async () => {
    const ctx = createAuthContext();
    const caller = ideasRouter.createCaller(ctx);
    
    expect(caller.generate).toBeDefined();
  });
});
