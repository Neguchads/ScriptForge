import { describe, it, expect, afterAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { users, userPreferences } from "../drizzle/schema";
import { eq, like } from "drizzle-orm";

const EMAIL = `sec-test-${Date.now()}@scriptforge.local`;
const PASSWORD = "senha-de-teste-123";

function makeCtx(user: unknown = null) {
  const cookies: Record<string, unknown> = {};
  return {
    cookies,
    ctx: {
      req: { protocol: "http", headers: {} },
      res: {
        cookie: (name: string, value: unknown) => {
          cookies[name] = value;
        },
        clearCookie: (name: string) => {
          delete cookies[name];
        },
      },
      user,
    } as any,
  };
}

afterAll(async () => {
  const db = await getDb();
  if (db) await db.delete(users).where(like(users.email, "sec-test-%@scriptforge.local"));
});

describe("auth security", () => {
  it("exige aceite dos termos no cadastro", async () => {
    const { ctx } = makeCtx();
    await expect(
      appRouter.createCaller(ctx).auth.register({
        name: "Teste",
        email: EMAIL,
        password: PASSWORD,
        acceptTerms: false as any,
      })
    ).rejects.toThrow();
  });

  it("cadastra sem vazar passwordHash, com role user e termos registrados", async () => {
    const { ctx, cookies } = makeCtx();
    const user: any = await appRouter.createCaller(ctx).auth.register({
      name: "Teste",
      email: EMAIL,
      password: PASSWORD,
      acceptTerms: true,
    });
    expect(user.passwordHash).toBeUndefined();
    expect(user.role).toBe("user");
    expect(Object.keys(cookies).length).toBe(1);

    const db = await getDb();
    const [row] = await db!.select().from(users).where(eq(users.email, EMAIL));
    expect(row.termsAcceptedAt).toBeTruthy();
  });

  it("rejeita e-mail duplicado e senha errada com mensagem genérica", async () => {
    const { ctx } = makeCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.auth.register({ name: "X", email: EMAIL, password: PASSWORD, acceptTerms: true })
    ).rejects.toThrow(/cadastrado/);
    await expect(caller.auth.login({ email: EMAIL, password: "errada-errada" })).rejects.toThrow(
      "E-mail ou senha inválidos"
    );
    await expect(
      caller.auth.login({ email: "naoexiste@scriptforge.local", password: "qualquer-coisa" })
    ).rejects.toThrow("E-mail ou senha inválidos");
  });

  it("limita tamanho da senha", async () => {
    const { ctx } = makeCtx();
    await expect(
      appRouter.createCaller(ctx).auth.login({ email: EMAIL, password: "a".repeat(500) })
    ).rejects.toThrow();
  });

  it("exporta os dados sem hash de senha nem tokens do YouTube", async () => {
    const { ctx } = makeCtx();
    const login: any = await appRouter.createCaller(ctx).auth.login({ email: EMAIL, password: PASSWORD });
    const { ctx: authed } = makeCtx(login);
    const data: any = await appRouter.createCaller(authed).auth.exportMyData();
    expect(data.account.email).toBe(EMAIL);
    expect(data.account.passwordHash).toBeUndefined();
    expect(data.youtubeAuth).toBeUndefined();
  });

  it("exclui a conta e os dados, exigindo a senha certa", async () => {
    const { ctx } = makeCtx();
    const login: any = await appRouter.createCaller(ctx).auth.login({ email: EMAIL, password: PASSWORD });
    const db = await getDb();
    await db!.insert(userPreferences).values({ userId: login.id } as any);

    const { ctx: authed } = makeCtx(login);
    const caller = appRouter.createCaller(authed);
    await expect(caller.auth.deleteAccount({ password: "errada-errada" })).rejects.toThrow("Senha incorreta");

    await caller.auth.deleteAccount({ password: PASSWORD });
    const remainingUsers = await db!.select().from(users).where(eq(users.email, EMAIL));
    const remainingPrefs = await db!.select().from(userPreferences).where(eq(userPreferences.userId, login.id));
    expect(remainingUsers.length).toBe(0);
    expect(remainingPrefs.length).toBe(0);
  });
});
