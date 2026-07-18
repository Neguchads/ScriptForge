# ScriptForge - Unified Music & Video Creation Platform

**ScriptForge** é uma plataforma unificada que combina a criação de conteúdo YouTube (ScriptTube AI) com a geração de música com IA (Suno Forge) em um único ecossistema coeso.

## 🎯 Visão Geral

ScriptForge permite que criadores de conteúdo:

1. **Criem roteiros de vídeo** com ideias, scripts, thumbnails e gerenciamento YouTube
2. **Gerem músicas com IA** com letras, estilos, imagens e audio lab
3. **Liguem música a roteiros** (Vídeo → Música)
4. **Liguem roteiros a projetos musicais** (Música → Vídeo)
5. **Trabalhem em paralelo** (ambos independentes)

## 🏗️ Arquitetura

### Stack Tecnológico

- **Frontend**: React 19 + Tailwind 4 + shadcn/ui
- **Backend**: Express 4 + tRPC 11
- **Database**: MySQL/TiDB com Drizzle ORM
- **Auth**: Manus OAuth
- **Deployment**: Autoscale (Serverless)

### Estrutura de Banco de Dados

**22 Tabelas Unificadas:**

| Categoria | Tabelas | Descrição |
|-----------|---------|-----------|
| **Compartilhadas** | users, user_preferences | Usuário único para ambas plataformas |
| **YouTube** | niches, ideas, scripts, script_templates, flashcards, youtube_auth, youtube_uploads, video_analytics, quiz_* | Criação de conteúdo YouTube |
| **Música** | projects, generations, community_posts, chat_messages, style_combinations, exports | Geração de música com IA |
| **Webhooks** | webhook_logs, webhook_retries | Sistema de webhooks |
| **Integração** | script_music_links, project_script_links, ai_music | Links cruzados entre plataformas |

## 📁 Estrutura do Projeto

```
scriptforge-unified/
├── client/
│   ├── src/
│   │   ├── pages/          # Páginas de features
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── App.tsx         # Rotas e layout
│   │   └── index.css       # Tema dark cyber-music
│   └── public/
├── server/
│   ├── routers/            # tRPC routers (14 routers)
│   │   ├── integration.ts  # NEW: Linking script-music
│   │   ├── music.ts        # Music generation
│   │   ├── lyrics.ts       # Lyrics generation
│   │   ├── style.ts        # Style & prompt
│   │   ├── fullSong.ts     # Full song creator
│   │   ├── image.ts        # Image generator
│   │   ├── audioLab.ts     # Audio lab
│   │   ├── chat.ts         # AI assistant
│   │   ├── library.ts      # My library
│   │   ├── explore.ts      # Explore community
│   │   ├── export.ts       # Export & share
│   │   └── ...
│   ├── db.ts               # 60+ DB helpers
│   ├── _core/              # Framework plumbing
│   └── routers.ts          # App router
├── drizzle/
│   └── schema.ts           # 22 tabelas unificadas
└── todo.md                 # Rastreamento de features
```

## 🚀 Fluxos de Trabalho

### 1. Vídeo → Música (Video-First)

```
1. Usuário cria roteiro (Script Creator)
2. Gera ideias de conteúdo (Ideas Generator)
3. Cria thumbnail (Thumbnails Generator)
4. Gera música para acompanhar (Lyrics Generator)
5. Liga música ao roteiro (integration.linkMusicToScript)
6. Faz upload para YouTube (YouTube Manager)
```

### 2. Música → Vídeo (Music-First)

```
1. Usuário cria projeto de música (Projects)
2. Gera letra (Lyrics Generator)
3. Seleciona estilo (Style & Prompt)
4. Cria música completa (Full Song Creator)
5. Cria roteiro para acompanhar (Script Creator)
6. Liga roteiro ao projeto (integration.linkScriptToProject)
```

### 3. Paralelo (Independent)

```
1. Usuário trabalha em música independentemente
2. Usuário trabalha em vídeo independentemente
3. Opcionalmente liga depois (integration routers)
```

## 🔌 API Routers

### Music Routers (Integrados do Suno Forge)

- `lyrics.generate` - Gerar letras com IA
- `style.generate` - Gerar estilos e prompts
- `fullSong.generate` - Criar música completa
- `image.generate` - Gerar imagem de capa
- `audioLab.generate` - Variações com parâmetros
- `chat.message` - Assistente conversacional
- `library.list` - Histórico de gerações
- `explore.getPublic` - Galeria comunitária
- `export.exportPdf` - Exportar como PDF
- `export.exportJson` - Exportar como JSON
- `export.shareLink` - Gerar link compartilhável

### Integration Routers (NEW)

- `integration.linkMusicToScript` - Associar música a roteiro
- `integration.getScriptMusicLinks` - Recuperar músicas de roteiro
- `integration.removeScriptMusicLink` - Remover associação
- `integration.linkScriptToProject` - Associar roteiro a projeto
- `integration.getProjectScripts` - Recuperar roteiros de projeto
- `integration.removeProjectScriptLink` - Remover associação
- `integration.reorderProjectScripts` - Reordenar roteiros

### YouTube Routers (Deferred)

*Será implementado na próxima fase:*
- YouTube OAuth integration
- Ideas Generator
- Script Creator
- Thumbnails Generator
- YouTube Manager
- Video Analytics

## 🎨 Design & Branding

- **Visual**: Dark cyber-music do Suno Forge
- **Cores**: Neon gradients, dark backgrounds
- **Tipografia**: Orbitron (headings) + Inter (body)
- **Animações**: Smooth transitions, hover effects
- **Tema**: Futurista, moderno, premium

## 🔐 Segurança

- ✅ Manus OAuth integrado
- ✅ Role-based access control (user/admin)
- ✅ Input validation com Zod
- ✅ Proteção contra CSRF
- ✅ Rate limiting (a implementar)
- ✅ Audit logging (a implementar)

## 📊 Banco de Dados

### Exemplo: Linking Script to Music

```typescript
// Frontend
const { mutate: linkMusic } = trpc.integration.linkMusicToScript.useMutation();

linkMusic({
  scriptId: 123,
  musicGenerationId: 456,
});

// Backend
export async function linkMusicToScript(userId: number, data: {
  scriptId: number;
  musicGenerationId: number;
}) {
  const db = await getDb();
  return db.insert(scriptMusicLinks).values({
    userId,
    scriptId: data.scriptId,
    musicGenerationId: data.musicGenerationId,
    createdAt: new Date(),
  });
}
```

## 🧪 Testes

- ✅ 14 routers testados (Vitest)
- ✅ Integration tests (placeholder)
- ✅ 0 erros TypeScript
- ⏳ E2E tests (a implementar)
- ⏳ Performance tests (a implementar)

## 📝 Desenvolvimento

### Build Loop

1. **Schema**: Editar `drizzle/schema.ts` → `pnpm drizzle-kit generate` → `webdev_execute_sql`
2. **DB Helpers**: Adicionar em `server/db.ts`
3. **Routers**: Criar/estender em `server/routers/`
4. **Frontend**: Criar páginas em `client/src/pages/`
5. **Testes**: Adicionar em `server/routers/*.test.ts`

### Comandos Úteis

```bash
# Instalar dependências
pnpm install

# Compilar TypeScript
pnpm tsc --noEmit

# Rodar testes
pnpm test

# Gerar migrations
pnpm drizzle-kit generate

# Dev server
pnpm dev
```

## 🚀 Deployment

- **Hosting**: Manus Autoscale (Serverless)
- **Database**: MySQL/TiDB gerenciado
- **Storage**: S3 integrado
- **Domínio**: xxx.manus.space (customizável)

## 📚 Documentação

- [Análise Comparativa](./SCRIPTFORGE_ANALYSIS.md)
- [Progresso do Desenvolvimento](./SCRIPTFORGE_PROGRESS.md)
- [TODO List](./todo.md)

## 🔄 Próximas Fases

1. **Fase 4**: Implementar YouTube features
2. **Fase 5**: Adicionar workflow templates
3. **Fase 6**: Implementar social features
4. **Fase 7**: Monetização
5. **Fase 8**: Mobile app

## 👥 Contribuindo

ScriptForge é um projeto em desenvolvimento ativo. Para contribuir:

1. Crie uma branch para sua feature
2. Siga o padrão de código existente
3. Adicione testes
4. Crie um checkpoint antes de merge

## 📄 Licença

Propriedade intelectual do criador.

---

**Versão**: 1.0.0 (Beta)  
**Última Atualização**: Jun 30, 2026  
**Status**: 🟢 Pronto para Deploy
