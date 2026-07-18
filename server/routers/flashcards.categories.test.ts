import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";

describe("flashcards categories", () => {
  it("should have at least 13 categories", async () => {
    const caller = appRouter.createCaller({} as any);
    const categories = await caller.flashcards.categories();
    
    expect(categories.length).toBeGreaterThanOrEqual(13);
  });

  it("should have Técnico category", async () => {
    const caller = appRouter.createCaller({} as any);
    const categories = await caller.flashcards.categories();
    
    const tecnico = categories.find(c => c.name === 'Técnico');
    expect(tecnico).toBeDefined();
    expect(tecnico?.icon).toBe('🎙️');
  });

  it("should have Estratégia category", async () => {
    const caller = appRouter.createCaller({} as any);
    const categories = await caller.flashcards.categories();
    
    const estrategia = categories.find(c => c.name === 'Estratégia');
    expect(estrategia).toBeDefined();
    expect(estrategia?.icon).toBe('📈');
  });

  it("should have Monetização YouTube category", async () => {
    const caller = appRouter.createCaller({} as any);
    const categories = await caller.flashcards.categories();
    
    const monetizacao = categories.find(c => c.name === 'Monetização YouTube');
    expect(monetizacao).toBeDefined();
    expect(monetizacao?.icon).toBe('💰');
  });

  it("should have Produção category", async () => {
    const caller = appRouter.createCaller({} as any);
    const categories = await caller.flashcards.categories();
    
    const producao = categories.find(c => c.name === 'Produção');
    expect(producao).toBeDefined();
    expect(producao?.icon).toBe('🎬');
  });

  it("should have Análise category", async () => {
    const caller = appRouter.createCaller({} as any);
    const categories = await caller.flashcards.categories();
    
    const analise = categories.find(c => c.name === 'Análise');
    expect(analise).toBeDefined();
    expect(analise?.icon).toBe('📊');
  });

  it("should have at least 104 total flashcards", async () => {
    const caller = appRouter.createCaller({} as any);
    const flashcards = await caller.flashcards.all();
    
    expect(flashcards.length).toBeGreaterThanOrEqual(104);
  });

  it("should have 8 flashcards in Técnico category", async () => {
    const caller = appRouter.createCaller({} as any);
    const categories = await caller.flashcards.categories();
    const tecnico = categories.find(c => c.name === 'Técnico');
    
    if (tecnico) {
      const flashcards = await caller.flashcards.byCategory({ categoryId: tecnico.id });
      expect(flashcards.length).toBe(8);
    }
  });

  it("should have 8 flashcards in Estratégia category", async () => {
    const caller = appRouter.createCaller({} as any);
    const categories = await caller.flashcards.categories();
    const estrategia = categories.find(c => c.name === 'Estratégia');
    
    if (estrategia) {
      const flashcards = await caller.flashcards.byCategory({ categoryId: estrategia.id });
      expect(flashcards.length).toBe(8);
    }
  });

  it("should have 8 flashcards in Monetização YouTube category", async () => {
    const caller = appRouter.createCaller({} as any);
    const categories = await caller.flashcards.categories();
    const monetizacao = categories.find(c => c.name === 'Monetização YouTube');
    
    if (monetizacao) {
      const flashcards = await caller.flashcards.byCategory({ categoryId: monetizacao.id });
      expect(flashcards.length).toBe(8);
    }
  });

  it("should have 8 flashcards in Produção category", async () => {
    const caller = appRouter.createCaller({} as any);
    const categories = await caller.flashcards.categories();
    const producao = categories.find(c => c.name === 'Produção');
    
    if (producao) {
      const flashcards = await caller.flashcards.byCategory({ categoryId: producao.id });
      expect(flashcards.length).toBe(8);
    }
  });

  it("should have 8 flashcards in Análise category", async () => {
    const caller = appRouter.createCaller({} as any);
    const categories = await caller.flashcards.categories();
    const analise = categories.find(c => c.name === 'Análise');
    
    if (analise) {
      const flashcards = await caller.flashcards.byCategory({ categoryId: analise.id });
      expect(flashcards.length).toBe(8);
    }
  });
});
