import { describe, expect, it } from "vitest";
import { appRouter } from "../routers";

describe("templates router", () => {
  it("should list all templates", async () => {
    const caller = appRouter.createCaller({});
    const templates = await caller.templates.list();
    expect(Array.isArray(templates)).toBe(true);
    expect(templates.length).toBeGreaterThan(0);
  });

  it("should get template by id", async () => {
    const caller = appRouter.createCaller({});
    const templates = await caller.templates.list();
    if (templates.length > 0) {
      const template = await caller.templates.getById({ templateId: templates[0].id });
      expect(template).toBeDefined();
      expect(template?.id).toBe(templates[0].id);
    }
  });

  it("should get templates by type", async () => {
    const caller = appRouter.createCaller({});
    const templates = await caller.templates.getByType({ type: "tutorial" });
    expect(Array.isArray(templates)).toBe(true);
  });
});
