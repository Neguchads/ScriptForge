import { describe, it, expect } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { createRateLimiter } from "./rateLimit";

function run(limiter: ReturnType<typeof createRateLimiter>, path: string, method = "POST", ip = "1.1.1.1") {
  let status = 200;
  let body: unknown;
  let nextCalled = false;
  const req = { method, path, ip } as Request;
  const res = {
    setHeader: () => res,
    status(code: number) {
      status = code;
      return res;
    },
    json(payload: unknown) {
      body = payload;
      return res;
    },
  } as unknown as Response;
  const next: NextFunction = () => {
    nextCalled = true;
  };
  limiter(req, res, next);
  return { status, body, nextCalled };
}

describe("rate limiter", () => {
  it("bloqueia login após 10 tentativas por IP", () => {
    const limiter = createRateLimiter(() => 0);
    for (let i = 0; i < 10; i++) {
      expect(run(limiter, "/auth.login").nextCalled).toBe(true);
    }
    const blocked = run(limiter, "/auth.login");
    expect(blocked.nextCalled).toBe(false);
    expect(blocked.status).toBe(429);
  });

  it("não afeta outro IP", () => {
    const limiter = createRateLimiter(() => 0);
    for (let i = 0; i < 11; i++) run(limiter, "/auth.login", "POST", "1.1.1.1");
    expect(run(limiter, "/auth.login", "POST", "2.2.2.2").nextCalled).toBe(true);
  });

  it("libera de novo depois da janela", () => {
    let t = 0;
    const limiter = createRateLimiter(() => t);
    for (let i = 0; i < 11; i++) run(limiter, "/auth.login");
    t = 15 * 60_000 + 1;
    expect(run(limiter, "/auth.login").nextCalled).toBe(true);
  });

  it("não limita consultas (GET)", () => {
    const limiter = createRateLimiter(() => 0);
    for (let i = 0; i < 200; i++) {
      expect(run(limiter, "/auth.me", "GET").nextCalled).toBe(true);
    }
  });

  it("limita geração de imagem a 10 por janela", () => {
    const limiter = createRateLimiter(() => 0);
    for (let i = 0; i < 10; i++) run(limiter, "/image.generate");
    expect(run(limiter, "/thumbnails.generate").status).toBe(429);
  });

  it("devolve um erro por chamada do lote", () => {
    const limiter = createRateLimiter(() => 0);
    for (let i = 0; i < 10; i++) run(limiter, "/auth.login");
    const blocked = run(limiter, "/auth.login,auth.register");
    expect(Array.isArray(blocked.body) && (blocked.body as unknown[]).length).toBe(2);
  });
});
