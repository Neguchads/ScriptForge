# Handoff — Continuação no PC

Este documento resume tudo que foi feito numa sessão de análise/unificação
do ScriptForge, e o que fazer a seguir. Serve tanto pra você quanto pra
outra sessão do Claude Code retomar o trabalho sem precisar re-analisar
tudo de novo.

Branch com todo o trabalho: **`claude/project-analysis-uxr1mh`**
PR aberta (draft): https://github.com/Neguchads/ScriptForge/pull/1

---

## 1. Contexto: o que é o ScriptForge

Unificação de dois projetos anteriores:
- **scripttube-ai** → lado YouTube (ideias, roteiros, SEO, thumbnails)
- **sunoforge** → lado música com IA (letras, estilos, prompts)

Stack: React 19 + Tailwind 4 + Vite (front), Express + tRPC 11 (back),
MySQL/TiDB via Drizzle ORM.

## 2. O que foi analisado e descoberto

- **`sunoforge`** (repo original de música): completo e correto.
  73/73 testes passando, 0 erros de TypeScript. Já está 100% absorvido
  no ScriptForge — nada a importar de lá.
- **`scripttube-ai`** (repo que deveria ser o original de YouTube):
  na verdade é uma cópia quase idêntica do próprio ScriptForge (mesmo
  commit final "Checkpoint: ScriptForge v1.0"). Não existe, em nenhum
  lugar acessível, uma versão anterior com telas de YouTube prontas.
  **Pode ser apagado do GitHub sem perda de dados** (Settings → Danger
  Zone → Delete no repositório, é uma ação manual sua, eu não tenho
  permissão pra deletar repositórios).
- **ScriptForge**: tinha 3 routers de backend escritos mas nunca
  conectados (`music`, `thumbnails`, `transcription`) — bug real, corrigido.
- README/todo.md afirmavam "30+ páginas" e "140+ testes passando", mas na
  prática eram 13 páginas (só o lado música) e havia falhas de teste reais.

## 3. O que já foi corrigido e está no branch/PR

| Commit | O que faz |
|---|---|
| `39499cf` | Registra os 3 routers órfãos em `appRouter` |
| `b20be0b` | Cria `drizzle/seed.ts` — popula niches, flashcard categories/flashcards (~65) e script templates (5), recuperados dos logs `.manus/db/*.json` que nunca tinham virado seed reutilizável |
| `a3abc35` | Adiciona `docs/DATABASE_SETUP.md` com o guia de setup do TiDB Cloud |
| (próximo) | Cria 3 páginas de frontend de YouTube: `IdeasGenerator.tsx`, `ScriptCreator.tsx`, `ThumbnailsGenerator.tsx` + rotas em `App.tsx`. Validado rodando `pnpm dev` + Playwright headless — as 3 telas renderizam corretamente e batem com o padrão visual do resto do app (ver screenshots enviados no chat). Os botões de gerar dependem de login (routers são `protectedProcedure`), então a geração de conteúdo em si não foi testada de ponta a ponta (precisa de OAuth configurado) |

Tudo isso já passou em `pnpm check` (0 erros). Os testes que ainda falham
(`music`, `quiz`, `flashcards`, `templates`) falham só por falta de
`DATABASE_URL` configurada — não por bug de código.

## 4. O que fazer no PC, em ordem

### Passo 1 — Clonar e trocar de branch
```bash
git clone https://github.com/Neguchads/ScriptForge
cd ScriptForge
git checkout claude/project-analysis-uxr1mh
pnpm install
```

### Passo 2 — Configurar o banco (TiDB Cloud, decisão já tomada)
Siga **`docs/DATABASE_SETUP.md`** — guia completo passo a passo:
1. Criar conta e cluster Serverless gratuito em tidbcloud.com
2. Pegar a connection string em Connect → General
3. Criar `.env` na raiz com `DATABASE_URL=...`
4. Rodar:
   ```bash
   pnpm db:push   # cria as tabelas
   pnpm db:seed   # popula os dados de referência
   pnpm check     # deve continuar 0 erros
   pnpm test      # os testes que falhavam por falta de banco devem passar agora
   ```

### Passo 3 — Confirmar app rodando
```bash
pnpm dev
```
Acessar `http://localhost:3000` e conferir se as páginas de música carregam
dados reais (ex: Library, Explore).

### Passo 4 — Revisar e mergear a PR
Se tudo passou, revisar https://github.com/Neguchads/ScriptForge/pull/1
e mergear (ela está como draft — marcar como "ready for review" e mergear
quando estiver satisfeito).

### Passo 5 (opcional) — Apagar o `scripttube-ai`
Confirmado seguro (ver seção 2). Manual: Settings do repo → Danger Zone →
Delete this repository.

## 5. O que falta depois disso (roadmap de longo prazo)

Em ordem recomendada de prioridade:

1. **Frontend de YouTube** — feito nesta sessão:
   - ✅ `IdeasGenerator.tsx`, `ScriptCreator.tsx`, `ThumbnailsGenerator.tsx`
     criadas e validadas visualmente (rotas `/ideas`, `/scripts`,
     `/thumbnails` já registradas em `App.tsx`, já apareciam no menu do
     `AppLayout` mas sem página — agora têm)
   - ✅ **YouTube Manager**: OAuth real com Google implementado —
     `server/_core/youtubeApi.ts` (troca de código por token, refresh,
     estatísticas do canal, listagem de vídeos via YouTube Data API v3),
     `server/routers/youtube.ts` (router tRPC registrado), rota de
     callback `server/_core/youtubeOAuth.ts` registrada em
     `server/_core/index.ts`, página `YouTubeManager.tsx` com
     conectar/desconectar, cards de estatísticas e lista de vídeos.
     Requer `YOUTUBE_CLIENT_ID`/`YOUTUBE_CLIENT_SECRET` (documentado em
     `ENV_EXAMPLE.md`) — um projeto no Google Cloud Console com a
     YouTube Data API v3 habilitada, redirect URI
     `<origem>/api/youtube/oauth/callback`.
   - 🔲 **Upload de vídeo real** ainda não implementado — só a leitura
     (estatísticas + lista de vídeos). Fazer upload de fato exige lidar
     com arquivo binário (multipart/resumable), o que passa de longe do
     limite de 50mb de JSON body já configurado no Express — decisão
     de dependência (multer/busboy) e de arquitetura que ficou de fora
     de propósito por enquanto.
   - 🔲 Testar o fluxo de ponta a ponta (login real via OAuth Manus +
     conectar Google + chamada ao LLM) — não foi possível nesta sessão
     por falta de `OAUTH_SERVER_URL`/`VITE_APP_ID`/`YOUTUBE_CLIENT_ID`
     configurados. Validei apenas visualmente (renderização das telas
     via Playwright headless, sem erros de console além dos já
     existentes por falta de env vars).
2. **Segurança** (Fase 8 do `todo.md`): RBAC, validação de input, rate
   limiting, CSRF, audit log — tudo pendente ainda
3. **Testes reais/E2E** (Fase 9): `integration.test.ts` hoje é placeholder
4. **Deploy validado** (Fase 10): `Dockerfile`/`docker-compose.yml`
   existem mas não foram testados de ponta a ponta

## 6. Decisões já tomadas (não precisa re-perguntar)

- Banco de dados: **MySQL via TiDB Cloud** (não Postgres — o schema
  inteiro usa `mysqlTable`/`mysqlEnum`, migrar seria um projeto à parte)
- Unificação sunoforge + scripttube-ai: **concluída**, nada mais a importar
  desses dois repos
- Dados de usuário no PC do usuário (fora do GitHub) ainda **não foram
  comparados** — isso fica pendente pra quando o usuário trouxer os
  arquivos

## 7. Nota de segurança

Os arquivos `.manus/db/*.json` no repositório expõem host, usuário e nome
de banco de um cluster TiDB Cloud antigo (sem senha visível — provavelmente
já expirado). Considerar não deixar esse tipo de log em repositórios daqui
pra frente, e opcionalmente limpar esse histórico do Git no futuro.
