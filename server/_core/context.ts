import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type SafeUser = Omit<User, "passwordHash">;

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: SafeUser | null;
};

// Nunca deixa o hash da senha sair pro cliente, nem em ctx.user.
export function stripPasswordHash(user: User): SafeUser {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: SafeUser | null = null;

  try {
    user = stripPasswordHash(await sdk.authenticateRequest(opts.req));
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
