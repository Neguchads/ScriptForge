# ScriptForge - Guia Completo de Setup com IA

## 🤖 Configuração da IA

ScriptForge integra **OpenAI LLM** para geração de conteúdo criativo. Este guia mostra como configurar tudo.

---

## 1️⃣ Obter Credenciais de IA

### OpenAI API Key

1. Vá para https://platform.openai.com/api/keys
2. Faça login com sua conta OpenAI
3. Clique em "Create new secret key"
4. Copie a chave (formato: `sk-...`)
5. **Guarde em local seguro** - você não consegue ver novamente

### Manus Built-in APIs (Recomendado para Manus)

Se estiver rodando no Manus:
- `BUILT_IN_FORGE_API_URL`: Fornecido pelo Manus
- `BUILT_IN_FORGE_API_KEY`: Fornecido pelo Manus
- `VITE_FRONTEND_FORGE_API_KEY`: Fornecido pelo Manus

---

## 2️⃣ Configurar Variáveis de Ambiente

### Arquivo `.env`

```bash
# ===== IA & LLM =====
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=seu-api-key-aqui
VITE_FRONTEND_FORGE_API_KEY=seu-frontend-key-aqui

# Alternativa: OpenAI direto (se não usar Manus)
OPENAI_API_KEY=sk-...

# ===== Database =====
DATABASE_URL=mysql://user:password@localhost:3306/scriptforge

# ===== Auth =====
JWT_SECRET=gere-uma-string-aleatoria-forte-aqui
VITE_APP_ID=seu-oauth-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# ===== Owner Info =====
OWNER_OPEN_ID=seu-open-id
OWNER_NAME=Seu Nome

# ===== YouTube (Opcional) =====
YOUTUBE_CLIENT_ID=seu-client-id
YOUTUBE_CLIENT_SECRET=seu-client-secret

# ===== Suno AI (Opcional) =====
SUNO_API_KEY=seu-suno-key
```

---

## 3️⃣ Instalar e Rodar Localmente

### Com Docker (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/Neguchads/scriptforge.git
cd scriptforge

# Crie o arquivo .env
cp .env.example .env
# Edite .env com suas credenciais

# Inicie com Docker Compose
docker-compose up -d

# Verifique os logs
docker-compose logs -f app

# Acesse http://localhost:3000
```

### Sem Docker (Node.js Local)

```bash
# Clone o repositório
git clone https://github.com/Neguchads/scriptforge.git
cd scriptforge

# Instale dependências
pnpm install

# Crie o arquivo .env
cp .env.example .env
# Edite .env com suas credenciais

# Inicie o servidor de desenvolvimento
pnpm dev

# Em outro terminal, acesse http://localhost:3000
```

---

## 4️⃣ Testar a IA

### Teste 1: Gerador de Letras

```bash
# No terminal, rode os testes
pnpm test

# Ou teste específico
pnpm test server/routers/lyrics.test.ts
```

### Teste 2: Gerador de Estilos

```bash
pnpm test server/routers/music.test.ts
```

### Teste 3: Chat com IA

```bash
# Acesse http://localhost:3000/chat
# Digite uma mensagem e veja a IA responder
```

---

## 5️⃣ Funcionalidades de IA Disponíveis

### 1. **Lyrics Generator** 🎤
Gera letras de músicas com IA:

```typescript
// Exemplo de uso no código
const lyrics = await trpc.music.generateLyrics.mutate({
  theme: "amor",
  genre: "pop",
  mood: "melancólico",
  voiceMode: "vocal",
  language: "pt-BR"
});
```

**Entrada:**
- Tema (ex: "amor", "natureza", "tecnologia")
- Gênero (ex: "pop", "rock", "samba")
- Humor (ex: "alegre", "triste", "energético")
- Modo de voz (instrumental, vocal, acapella, vocal+instrumental)
- Idioma

**Saída:**
- Letra completa estruturada
- Metadados (BPM, tom, estrutura)
- Prompt otimizado para Suno AI

---

### 2. **Style Mixer** 🎨
Combina infinitas possibilidades de estilos:

```typescript
const style = await trpc.music.generateStyle.mutate({
  genres: ["pop", "eletrônico"],
  characteristics: { mood: ["energético"], tempo: ["rápido"] },
  influences: ["The Weeknd", "Daft Punk"],
  eras: ["2010s", "2020s"],
  vocalStyles: ["R&B suave"],
  productionTechniques: ["síntese", "sampling"]
});
```

**Disponível:**
- 46+ gêneros musicais
- 100+ sub-gêneros
- 40+ influências (artistas/produtores)
- 11 eras musicais (1920s-2020s)
- 25 estilos vocais
- 30 técnicas de produção

**Saída:**
- Prompt formatado para Suno AI
- Descrição do estilo
- Sugestões de artistas similares

---

### 3. **Image Generator** 🖼️
Gera capas de álbum e artes visuais:

```typescript
const image = await trpc.music.generateImage.mutate({
  prompt: "capa de álbum futurista com neon",
  style: "cyberpunk",
  mood: "energético"
});
```

**Saída:**
- URL da imagem gerada
- Metadados (dimensões, estilo)
- Opção de regenerar

---

### 4. **AI Chat** 💬
Assistente especializado em música e criação:

```typescript
const response = await trpc.chat.sendMessage.mutate({
  message: "Como faço uma letra de rap sobre tecnologia?",
  context: "music" // ou "video", "general"
});
```

**Contextos:**
- `music` - Especializado em criação musical
- `video` - Especializado em criação de vídeos
- `general` - Assistente geral

---

### 5. **Ideas Generator** 💡
Gera ideias de vídeos baseadas em nicho:

```typescript
const ideas = await trpc.ideas.generate.mutate({
  niche: "tecnologia",
  trend: "IA",
  count: 5
});
```

---

### 6. **Script Creator** 📝
Cria roteiros estruturados:

```typescript
const script = await trpc.scripts.generate.mutate({
  idea: "Tutorial de IA para iniciantes",
  duration: 10, // minutos
  tone: "educativo",
  language: "pt-BR"
});
```

---

## 6️⃣ Troubleshooting

### Erro: "API Key inválida"

```bash
# Verifique se a chave está correta
echo $BUILT_IN_FORGE_API_KEY

# Ou verifique no arquivo .env
cat .env | grep FORGE_API_KEY
```

### Erro: "Conexão com banco de dados falhou"

```bash
# Verifique se o MySQL está rodando
docker-compose ps

# Ou se estiver local
mysql -u root -p

# Verifique a URL
echo $DATABASE_URL
```

### Erro: "LLM não respondeu"

```bash
# Verifique os logs
docker-compose logs app | grep -i error

# Ou teste a API diretamente
curl -X POST https://api.manus.im/v1/chat/completions \
  -H "Authorization: Bearer $BUILT_IN_FORGE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Olá"}]}'
```

---

## 7️⃣ Limites e Quotas

### OpenAI (se usar direto)
- **Rate Limit**: 3.500 RPM (Tier 1)
- **Tokens**: 90.000 TPM (Tier 1)
- **Custo**: ~$0.0015 por 1K tokens (GPT-3.5)

### Manus Built-in
- **Rate Limit**: Ilimitado (incluído)
- **Tokens**: Ilimitado (incluído)
- **Custo**: Incluído na assinatura

---

## 8️⃣ Próximos Passos

1. **Testar todas as funcionalidades**
   ```bash
   pnpm test
   ```

2. **Explorar a UI**
   - Acesse http://localhost:3000
   - Clique em "Começar Grátis"
   - Teste Lyrics Generator, Style Mixer, etc.

3. **Integrar com Suno AI** (opcional)
   - Obtenha chave em https://suno.ai
   - Configure `SUNO_API_KEY` no .env
   - Use prompts gerados para criar músicas reais

4. **Conectar YouTube** (opcional)
   - Obtenha credenciais em Google Cloud Console
   - Configure `YOUTUBE_CLIENT_ID` e `YOUTUBE_CLIENT_SECRET`
   - Faça upload direto de vídeos

---

## 📞 Suporte

- **Documentação**: Veja `docs/BACKEND.md` para detalhes técnicos
- **Issues**: Abra uma issue no GitHub
- **Email**: support@scriptforge.ai

---

**Desenvolvido com ❤️ para criadores de conteúdo**
