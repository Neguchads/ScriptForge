# SunoForge Backend Documentation

## Arquitetura

O backend é construído com **Express.js** + **tRPC** + **Drizzle ORM** + **MySQL**.

### Fluxo de Requisição

```
Client (React)
    ↓
tRPC Client (@trpc/react-query)
    ↓
tRPC Router (server/routers.ts)
    ↓
Database Helpers (server/db.ts)
    ↓
Drizzle ORM
    ↓
MySQL Database
```

## Estrutura de Pastas

```
server/
├── _core/
│   ├── index.ts              # Entry point, Express setup
│   ├── context.ts            # tRPC context (auth, db)
│   ├── trpc.ts               # tRPC instance
│   ├── env.ts                # Environment variables
│   ├── llm.ts                # LLM integration (OpenAI)
│   ├── imageGeneration.ts    # Image generation
│   ├── voiceTranscription.ts # Audio transcription
│   └── notification.ts       # Owner notifications
├── routers.ts                # All tRPC procedures
├── db.ts                     # Database query helpers
└── *.test.ts                 # Unit tests
```

## Database Schema

### Tabelas Principais

#### `users`
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `generations`
```sql
CREATE TABLE generations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  type ENUM('lyrics', 'style', 'image', 'audio') NOT NULL,
  title VARCHAR(255),
  content LONGTEXT NOT NULL,
  metadata JSON,
  isFavorite BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

#### `style_combinations`
```sql
CREATE TABLE style_combinations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  genres JSON NOT NULL,
  subgenres JSON NOT NULL,
  characteristics JSON NOT NULL,
  influences JSON NOT NULL,
  eras JSON NOT NULL,
  vocalStyles JSON NOT NULL,
  productionTechniques JSON NOT NULL,
  generatedPrompt TEXT NOT NULL,
  isFavorite BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

#### `chat_messages`
```sql
CREATE TABLE chat_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  role ENUM('user', 'assistant', 'system') NOT NULL,
  content LONGTEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

## tRPC Routers

### Auth Router

```typescript
router({
  me: publicProcedure.query(opts => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    // Clear session cookie
  }),
})
```

### Lyrics Router

```typescript
router({
  generate: protectedProcedure
    .input(z.object({
      theme: z.string(),
      genre: z.string(),
      mood: z.string(),
      voiceMode: z.enum(['instrumental', 'vocal', 'acapella', 'vocal+instrumental']),
      // ... mais campos
    }))
    .mutation(async ({ ctx, input }) => {
      // Chama LLM para gerar letra
      // Salva no banco
      // Retorna resultado
    }),
})
```

### Style Router

```typescript
router({
  generate: protectedProcedure
    .input(z.object({
      genres: z.array(z.string()),
      characteristics: z.record(z.array(z.string())),
      influences: z.array(z.string()),
      eras: z.array(z.string()),
      vocalStyles: z.array(z.string()),
      productionTechniques: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      // Valida compatibilidade
      // Chama LLM para gerar prompt
      // Retorna resultado formatado
    }),
})
```

### Image Router

```typescript
router({
  generate: protectedProcedure
    .input(z.object({
      prompt: z.string(),
      style: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Chama image generation service
      // Salva URL no storage
      // Retorna URL
    }),
})
```

### Library Router

```typescript
router({
  save: protectedProcedure
    .input(z.object({
      type: z.enum(['lyrics', 'style', 'image']),
      title: z.string(),
      content: z.string(),
      metadata: z.record(z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Salva geração no banco
      // Invalida cache
      // Retorna sucesso
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    // Lista todas as gerações do usuário
    // Retorna com paginação
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Deleta geração
      // Invalida cache
    }),

  toggleFavorite: protectedProcedure
    .input(z.object({ id: z.number(), isFavorite: z.boolean() }))
    .mutation(async ({ input }) => {
      // Marca/desmarca como favorito
    }),
})
```

### StyleCombo Router

```typescript
router({
  save: protectedProcedure.mutation(...),
  list: protectedProcedure.query(...),
  toggleFavorite: protectedProcedure.mutation(...),
  delete: protectedProcedure.mutation(...),
})
```

### Chat Router

```typescript
router({
  sendMessage: protectedProcedure
    .input(z.object({
      message: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Salva mensagem do usuário
      // Chama LLM com contexto
      // Salva resposta da IA
      // Retorna resposta
    }),

  getHistory: protectedProcedure.query(async ({ ctx }) => {
    // Retorna histórico de chat do usuário
  }),
})
```

## LLM Integration

### Usando `invokeLLM`

```typescript
import { invokeLLM } from "./server/_core/llm";

const response = await invokeLLM({
  messages: [
    { role: "system", content: "You are a music expert..." },
    { role: "user", content: "Generate a rock song..." },
  ],
});

// Resposta com markdown
const content = response.choices[0].message.content;
```

### Structured Responses (JSON Schema)

```typescript
const structured = await invokeLLM({
  messages: [...],
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "song_lyrics",
      strict: true,
      schema: {
        type: "object",
        properties: {
          verse1: { type: "string" },
          chorus: { type: "string" },
          bridge: { type: "string" },
        },
        required: ["verse1", "chorus"],
        additionalProperties: false,
      },
    },
  },
});
```

## Image Generation

```typescript
import { generateImage } from "./server/_core/imageGeneration";

const { url: imageUrl } = await generateImage({
  prompt: "A serene landscape with mountains",
});

// Para editar imagem existente
const { url: editedUrl } = await generateImage({
  prompt: "Add a rainbow to this landscape",
  originalImages: [{
    url: "https://example.com/original.jpg",
    mimeType: "image/jpeg"
  }]
});
```

## Storage (S3)

```typescript
import { storagePut } from "./server/storage";

// Upload arquivo
const { key, url } = await storagePut(
  `${userId}-files/${fileName}.png`,
  fileBuffer,
  "image/png"
);

// URL pode ser usada diretamente no frontend
// /manus-storage/{key}
```

## Database Helpers

### Query Helpers (server/db.ts)

```typescript
// Usuários
export async function upsertUser(user: InsertUser): Promise<void>
export async function getUserByOpenId(openId: string)

// Gerações
export async function saveGeneration(userId: number, data: GenerationInput)
export async function listUserGenerations(userId: number, type?: string)
export async function deleteGeneration(id: number)
export async function toggleGenerationFavorite(id: number, isFavorite: boolean)

// Style Combinations
export async function saveStyleCombination(userId: number, data: StyleComboInput)
export async function listUserStyleCombos(userId: number)
export async function deleteStyleCombo(id: number)
export async function toggleStyleComboFavorite(id: number, isFavorite: boolean)

// Chat
export async function saveChatMessage(userId: number, role: string, content: string)
export async function getChatHistory(userId: number, limit: number = 50)
```

## Authentication Flow

1. **Frontend**: Redireciona para `/api/oauth/callback` com state
2. **Backend**: Valida OAuth, cria/atualiza usuário
3. **Cookie**: Sessão salva em cookie seguro
4. **Context**: Cada request tRPC injeta `ctx.user`
5. **Protected**: Procedures usam `protectedProcedure` para validar auth

```typescript
// Verificar autenticação
const { user } = ctx; // null se não autenticado
if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });
```

## Error Handling

```typescript
import { TRPCError } from "@trpc/server";

// Erro de validação
throw new TRPCError({
  code: 'BAD_REQUEST',
  message: 'Invalid input',
});

// Erro de autorização
throw new TRPCError({
  code: 'FORBIDDEN',
  message: 'You do not have permission',
});

// Erro de servidor
throw new TRPCError({
  code: 'INTERNAL_SERVER_ERROR',
  message: 'Something went wrong',
});
```

## Testing

```typescript
import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("lyrics.generate", () => {
  it("should generate lyrics with valid input", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.lyrics.generate({
      theme: "love",
      genre: "pop",
      mood: "uplifting",
      voiceMode: "vocal",
      // ...
    });
    expect(result.lyrics).toBeDefined();
  });
});
```

## Performance Tips

1. **Caching**: Use `invalidate()` no frontend para cache do tRPC
2. **Pagination**: Implemente para listas grandes (100+ itens)
3. **Indexing**: Adicione índices no banco para `userId`, `createdAt`
4. **Batch Queries**: Combine múltiplas queries em uma quando possível
5. **Rate Limiting**: Limite requisições por usuário

## Deployment

### Variáveis de Ambiente

```env
NODE_ENV=production
DATABASE_URL=mysql://user:pass@host:3306/db
JWT_SECRET=your-secret-key
VITE_APP_ID=oauth-app-id
OAUTH_SERVER_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
```

### Build

```bash
pnpm build
NODE_ENV=production node dist/index.js
```

## Troubleshooting

**Erro: "Database connection failed"**
- Verifique `DATABASE_URL`
- Certifique-se que MySQL está rodando
- Teste conexão: `mysql -u user -p -h host db_name`

**Erro: "Unauthorized"**
- Verifique se cookie de sessão está sendo enviado
- Verifique `JWT_SECRET`
- Limpe cookies do navegador

**Erro: "LLM rate limit exceeded"**
- Implemente retry com backoff exponencial
- Implemente cache de respostas
- Limite requisições por usuário

---

Para mais detalhes, veja [DEVELOPMENT.md](./DEVELOPMENT.md)
