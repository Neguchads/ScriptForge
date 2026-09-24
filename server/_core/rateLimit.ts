import type { NextFunction, Request, Response } from "express";

type Rule = {
  name: string;
  windowMs: number;
  max: number;
  applies: (procedure: string) => boolean;
};

const RULES: Rule[] = [
  {
    name: "auth",
    windowMs: 15 * 60_000,
    max: 10,
    applies: p => p === "auth.login" || p === "auth.register",
  },
  {
    name: "image",
    windowMs: 5 * 60_000,
    max: 10,
    applies: p => p.startsWith("image.") || p.startsWith("thumbnails."),
  },
  { name: "mutation", windowMs: 60_000, max: 60, applies: () => true },
];

type Bucket = { count: number; resetAt: number };

// Limite em memória por IP, só em mutações (POST). Reinicia junto com o servidor.
export function createRateLimiter(now: () => number = Date.now) {
  const buckets = new Map<string, Bucket>();

  const prune = setInterval(() => {
    const t = now();
    buckets.forEach((bucket, key) => {
      if (bucket.resetAt <= t) buckets.delete(key);
    });
  }, 5 * 60_000);
  prune.unref();

  return function rateLimit(req: Request, res: Response, next: NextFunction) {
    if (req.method !== "POST") return next();

    const procedures = req.path.replace(/^\//, "").split(",").filter(Boolean);
    const ip = req.ip ?? "unknown";
    const t = now();
    let retryAfterMs = 0;

    for (const procedure of procedures) {
      for (const rule of RULES) {
        if (!rule.applies(procedure)) continue;

        const key = `${rule.name}:${ip}`;
        let bucket = buckets.get(key);
        if (!bucket || bucket.resetAt <= t) {
          bucket = { count: 0, resetAt: t + rule.windowMs };
          buckets.set(key, bucket);
        }
        bucket.count += 1;
        if (bucket.count > rule.max) {
          retryAfterMs = Math.max(retryAfterMs, bucket.resetAt - t);
        }
      }
    }

    if (retryAfterMs === 0) return next();

    res.setHeader("Retry-After", Math.ceil(retryAfterMs / 1000));
    // Formato de erro que o cliente tRPC (com superjson) entende, um por chamada do lote.
    const error = {
      error: {
        json: {
          message: "Muitas requisições. Aguarde um pouco e tente de novo.",
          code: -32600,
          data: { code: "TOO_MANY_REQUESTS", httpStatus: 429 },
        },
      },
    };
    res.status(429).json(procedures.map(() => error));
  };
}
