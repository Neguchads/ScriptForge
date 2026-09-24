import type { NextFunction, Request, Response } from "express";

const isProduction = () => process.env.NODE_ENV === "production";

// Em produção, recusa subir com configuração insegura ou incompleta.
export function assertProductionConfig() {
  if (!isProduction()) return;

  const problems: string[] = [];
  if (!process.env.DATABASE_URL) problems.push("DATABASE_URL não definida");
  const secret = process.env.JWT_SECRET ?? "";
  if (secret.length < 32) problems.push("JWT_SECRET ausente ou com menos de 32 caracteres");
  if (!process.env.VITE_APP_ID) problems.push("VITE_APP_ID não definida");

  if (problems.length > 0) {
    throw new Error(`Configuração inválida para produção: ${problems.join("; ")}`);
  }
}

// CSP só em produção: o Vite em desenvolvimento precisa de scripts inline e HMR.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  if (isProduction()) {
    res.setHeader("Content-Security-Policy", CSP);
    if (req.secure) {
      res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
    }
  }
  next();
}
