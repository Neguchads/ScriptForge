# Configuração do Banco de Dados (TiDB Cloud) e Próximos Passos

Este documento existe porque o ScriptForge nunca teve um `DATABASE_URL` real
configurado nesta sessão de análise — os testes que dependem de banco falham
hoje com `Database not available`. Este é o passo a passo pra resolver isso
e continuar o trabalho de unificação a partir daqui (inclusive no seu PC).

## Contexto rápido (o que já foi feito)

- Analisado o ScriptForge e comparado com os repositórios de origem
  (`sunoforge` e `scripttube-ai`) — ambos já estão 100% absorvidos aqui,
  nenhum dado externo perdido a importar deles.
- Corrigido: 3 routers que existiam no backend mas nunca foram registrados
  em `appRouter` (`music`, `thumbnails`, `transcription`) — PR aberta:
  https://github.com/Neguchads/ScriptForge/pull/1
- Criado `drizzle/seed.ts` — recupera dos logs de desenvolvimento antigos
  (`.manus/db/*.json`) os dados de referência que nunca viraram seed
  reutilizável: 8 nichos, 13 categorias de flashcards com ~65 flashcards,
  5 templates de roteiro. Roda com `pnpm db:seed`, é idempotente.
- **Ainda não validado contra um banco real** — é exatamente isso que este
  documento resolve.

## Passo 1: Criar o cluster no TiDB Cloud

1. Acesse **https://tidbcloud.com** e crie uma conta (dá pra usar login do
   GitHub ou Google).
2. Crie um cluster **Serverless** (tier gratuito, até 5GB e uso mensal
   generoso sem cartão de crédito).
3. Escolha uma região (ex: `us-east-1`, mesma usada no cluster antigo que
   aparecia nos logs de desenvolvimento).
4. Dê um nome ao cluster, por exemplo `scriptforge`.

## Passo 2: Pegar a connection string

1. No painel do cluster, clique em **Connect**.
2. Em "Connect With", selecione **General** (conexão MySQL padrão, não a
   opção de driver específico).
3. Copie a connection string. O formato é parecido com:
   ```
   mysql://usuario.xxxxx:SENHA@gateway01.xxxxx.prod.aws.tidbcloud.com:4000/nome_do_banco?ssl={"rejectUnauthorized":true}
   ```
4. **Importante**: o TiDB Cloud mostra a senha gerada só uma vez, na hora da
   criação da credencial. Guarde em um cofre de senhas.

## Passo 3: Configurar o `.env` local

Na raiz do projeto, copie `ENV_EXAMPLE.md` como referência e crie um `.env`:

```env
DATABASE_URL=mysql://usuario.xxxxx:SENHA@gateway01.xxxxx.prod.aws.tidbcloud.com:4000/scriptforge?ssl={"rejectUnauthorized":true}
```

`.env` já está no `.gitignore` — não vai ser commitado.

## Passo 4: Aplicar o schema e popular os dados

```bash
pnpm install        # se ainda não rodou
pnpm db:push        # cria as ~27 tabelas a partir de drizzle/schema.ts
pnpm db:seed        # popula niches, flashcard categories/flashcards e templates
```

O `db:seed` é seguro de rodar mais de uma vez — ele verifica se os dados já
existem antes de inserir.

## Passo 5: Validar

```bash
pnpm check   # deve continuar em 0 erros
pnpm test    # os testes que hoje falham com "Database not available"
             # (music, quiz, flashcards, templates) devem passar agora
```

Se algum teste continuar falhando por outro motivo (não relacionado a
"Database not available"), é um bug real a investigar separadamente.

## Passo 6: Rodar a aplicação localmente

```bash
pnpm dev
```

Acesse `http://localhost:3000` (ou a porta configurada) e confirme que as
telas de música (Lyrics, Style, Full Song, etc.) carregam dados reais.

---

## Roadmap: o que falta depois disso

Depois que o banco estiver validado, esta é a ordem recomendada:

1. ✅ ~~Importação/unificação sunoforge + scripttube-ai~~ — confirmado, nada a importar
2. ✅ ~~Fix dos routers órfãos~~ — PR #1
3. ✅ ~~Seed de dados de referência~~ — este documento
4. 🔲 **Banco de dados real configurado e validado** — você está aqui
5. 🔲 **Frontend de YouTube** (Ideas Generator, Script Creator, Thumbnails
   Generator, YouTube Manager) — não existe em nenhum lugar (nem no
   `scripttube-ai`, que é idêntico ao ScriptForge). Vai ter que ser
   desenhado do zero, seguindo o padrão visual das páginas de música já
   existentes (`AppLayout`, tema dark cyber-music, componentes shadcn/ui
   documentados em `docs/FRONTEND.md`). O backend de `ideas` e `scripts`
   já existe e está registrado; falta criar um router de YouTube Manager
   (OAuth, upload, analytics) — hoje só existe `server/_core/youtubeApi.ts`
   como helper de baixo nível, sem endpoints tRPC expostos.
6. 🔲 **Segurança** (Fase 8 do `todo.md`): RBAC, validação de input mais
   rigorosa, rate limiting, CSRF, audit log.
7. 🔲 **Testes reais/E2E** (Fase 9): hoje `integration.test.ts` é
   "placeholder" segundo o próprio `todo.md`.
8. 🔲 **Deploy validado** (Fase 10): `Dockerfile` e `docker-compose.yml` já
   existem, mas não foram testados de ponta a ponta nesta sessão.

## Nota de segurança

Os logs `.manus/db/*.json` (usados para montar o `drizzle/seed.ts`) expõem
host, usuário e nome de banco de um cluster TiDB Cloud antigo (sem senha
visível). Provavelmente já expirado, mas vale considerar não deixar esse
tipo de log em repositórios daqui pra frente.
