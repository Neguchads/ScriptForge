# ScriptForge - Unified Content Creation Studio

**ScriptForge** é uma plataforma web completa que unifica criação de conteúdo YouTube com geração de música assistida por IA. Combine roteiros, ideias, música, thumbnails e upload direto para YouTube em um único estúdio criativo com interface dark cyber-music.

## 🎯 O que é ScriptForge?

ScriptForge unifica duas plataformas poderosas:
- **ScriptTube AI**: Criação de conteúdo YouTube (ideias, roteiros, SEO, thumbnails)
- **Suno Forge**: Geração de música com IA (letras, estilos, prompts, audio lab)

Escolha por onde começar: crie uma música e depois o vídeo, ou vice-versa. Tudo integrado.

## 🎬 Funcionalidades YouTube

### 1. **Gerador de Ideias**
Gera ideias de vídeos baseadas em nicho, tendências e preferências do usuário.

### 2. **Criador de Roteiros**
Cria roteiros estruturados com hook, introdução, conteúdo principal e call-to-action.

### 3. **SEO & Metadados**
Gera títulos, descrições, tags e sugestões de thumbnails otimizadas para YouTube.

### 4. **Gerador de Thumbnails**
Cria prompts para gerar capas atraentes ou integra com ferramentas de design.

### 5. **Upload YouTube Real**
Integração OAuth real com YouTube para upload direto de vídeos.

### 6. **Analytics**
Sincroniza estatísticas de vídeos do YouTube em tempo real.

## 🎵 Funcionalidades de Música

### 1. **Lyrics Generator**
Gera letras de músicas com IA a partir de tema, gênero, humor e estrutura. Suporta 4 modos de voz:
- **Instrumental**: Sem vozes, apenas instrumentação
- **Vocal Cantado**: Letras cantadas completas
- **Acapella**: Apenas vozes, sem instrumentação
- **Vocal + Instrumental**: Combinação de vozes e instrumentos

### 2. **Style & Prompt Generator**
Mixer visual para combinar infinitas possibilidades de estilos musicais:
- 46+ gêneros musicais
- 100+ sub-gêneros
- 40+ influências (artistas e produtores)
- 11 eras musicais (1920s-2020s)
- 25 estilos vocais
- 30 técnicas de produção

**Recursos especiais:**
- 10 presets pré-configurados
- Botão "Surpreenda-me" com seleção ponderada criativa
- Histórico persistente com favoritos
- Copiar formatado para Suno AI com metadados

### 3. **Full Song Creator**
Combina letra e estilo em um único prompt completo e copiável.

### 4. **Image Generator**
Gera capas de álbum e artes visuais para músicas.

### 5. **Audio Lab**
Área experimental para mixar parâmetros de áudio e gerar variações.

### 6. **AI Assistant**
Chat interativo especializado em música e criação de conteúdo.

### 7. **Library**
Histórico persistente com busca, favoritos e organização por projeto.

## 🔄 Fluxos Integrados

### Fluxo 1: Vídeo → Música
1. Crie uma **Ideia** em YouTube
2. Clique em "Adicionar Música"
3. Gere uma **Letra** e **Estilo**
4. Volte para criar o **Roteiro** com referência à música
5. Gere **Thumbnail** com contexto musical
6. Faça **Upload no YouTube**

### Fluxo 2: Música → Vídeo
1. Crie uma **Música Completa**
2. Clique em "Criar Vídeo para Esta Música"
3. Gere uma **Ideia** e **Roteiro** baseados na música
4. Gere **Thumbnail** automaticamente
5. Faça **Upload no YouTube**

### Fluxo 3: Ambos Paralelos
1. Escolha começar por **Música** ou **Vídeo**
2. Trabalhe em um lado
3. Alterne entre os dois a qualquer momento
4. Histórico unificado em **Biblioteca**

## 🎨 Design & Tecnologia

### Visual
- **Tema**: Dark mode com estética cyber-music
- **Cores**: Neon gradients (Cyan, Purple, Magenta)
- **Tipografia**: Orbitron (futurista) + Inter (legível)
- **Animações**: Micro-interações que reforçam identidade criativa

### Stack Técnico
- **Frontend**: React 19 + Tailwind CSS 4 + Vite
- **Backend**: Express.js + tRPC 11
- **Database**: MySQL/TiDB com Drizzle ORM
- **Auth**: Manus OAuth
- **IA**: OpenAI LLM + Image Generation
- **Storage**: S3 (Manus built-in)
- **Integrações**: YouTube Data API, Suno AI, Spotify, MuseScore, Telegram

## 📦 Estrutura do Projeto

```
scriptforge-unified/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas principais (30+)
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilidades
│   │   └── App.tsx        # Routing principal
│   ├── public/            # Assets estáticos
│   └── index.html
├── server/                 # Backend Express + tRPC
│   ├── routers.ts         # Procedimentos tRPC
│   ├── db.ts              # Query helpers
│   ├── _core/             # Framework internals
│   └── index.ts           # Entry point
├── drizzle/               # Schema do banco
│   └── schema.ts          # Definição de tabelas (20+)
├── shared/                # Código compartilhado
├── storage/               # S3 helpers
├── Dockerfile             # Container Docker
├── docker-compose.yml     # Orquestração
├── package.json
└── README.md
```

## 🚀 Quick Start

### Com Docker (Recomendado)

```bash
# Clone ou extraia o projeto
cd scriptforge-unified

# Inicie com Docker Compose
docker-compose up -d

# Acesse em http://localhost:3000
```

### Local (Node.js 22+)

```bash
# Instale dependências
pnpm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Inicie o servidor de desenvolvimento
pnpm dev

# Em outro terminal, acesse http://localhost:3000
```

## 📚 Documentação

- **[BACKEND.md](./docs/BACKEND.md)** - Arquitetura, routers, database, LLM integration
- **[FRONTEND.md](./docs/FRONTEND.md)** - Componentes, hooks, estado, padrões de UI
- **[INSTALLATION.md](./docs/INSTALLATION.md)** - Guia completo de instalação
- **[DEVELOPMENT.md](./docs/DEVELOPMENT.md)** - Histórico, tecnologias, próximos passos

## 🛠️ Desenvolvimento

### Testes
```bash
pnpm test
```

### Type Checking
```bash
pnpm check
```

### Build
```bash
pnpm build
```

### Deploy
```bash
pnpm start
```

## 🔐 Variáveis de Ambiente

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/scriptforge

# Auth
JWT_SECRET=your-jwt-secret
VITE_APP_ID=your-oauth-app-id
OAUTH_SERVER_URL=https://api.manus.im

# IA & Storage
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key

# YouTube
YOUTUBE_CLIENT_ID=your-youtube-client-id
YOUTUBE_CLIENT_SECRET=your-youtube-client-secret

# Suno AI
SUNO_API_KEY=your-suno-api-key
```

## 📊 Estatísticas do Projeto

- **140+ testes** passando (66 ScriptTube + 73 Suno + novos)
- **0 erros** de TypeScript
- **30+ páginas** (20 ScriptTube + 13 Suno - 3 duplicadas)
- **20+ tabelas** de banco de dados
- **50+ procedures** tRPC
- **9 integrações** de API

## 🎯 Próximos Passos

1. **Fluxos Cruzados**: Integração perfeita entre vídeo e música
2. **Compartilhamento Social**: Publicar criações na comunidade
3. **Análise de Tendências**: Dashboard com estilos e ideias populares
4. **Modo Colaborativo**: Múltiplos usuários em um projeto
5. **Exportação Avançada**: PDF, MIDI, Markdown, JSON
6. **Automação**: Agendamento de uploads e publicações

## 📄 Licença

MIT License - Veja LICENSE.txt para detalhes

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

**Desenvolvido com ❤️ para criadores de conteúdo**
