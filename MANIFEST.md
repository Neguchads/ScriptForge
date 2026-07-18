# SunoForge - Project Manifest

## 📦 Conteúdo do Pacote

Este pacote contém a plataforma completa **SunoForge** - um sistema de criação musical assistida por IA.

### Estrutura de Pastas

```
sunoforge/
├── README.md                          # Visão geral do projeto
├── MANIFEST.md                        # Este arquivo
├── ENV_EXAMPLE.md                     # Exemplo de variáveis de ambiente
├── Dockerfile                         # Containerização
├── docker-compose.yml                 # Orquestração Docker
├── package.json                       # Dependências Node.js
├── pnpm-lock.yaml                     # Lock file
│
├── client/                            # Frontend React
│   ├── src/
│   │   ├── pages/                     # 10 páginas principais
│   │   ├── components/                # Componentes reutilizáveis
│   │   ├── contexts/                  # React contexts
│   │   ├── hooks/                     # Custom hooks
│   │   ├── lib/                       # Utilidades
│   │   ├── App.tsx                    # Routing
│   │   ├── main.tsx                   # Entry point
│   │   └── index.css                  # Tema dark cyber-music
│   ├── public/                        # Assets estáticos
│   └── index.html
│
├── server/                            # Backend Express + tRPC
│   ├── _core/                         # Framework internals
│   ├── routers.ts                     # tRPC procedures
│   ├── db.ts                          # Database helpers
│   └── *.test.ts                      # Unit tests (52 testes)
│
├── drizzle/                           # Database schema
│   ├── schema.ts                      # Tabelas (users, generations, etc.)
│   └── *.sql                          # Migrações
│
├── shared/                            # Código compartilhado
│   ├── musicStyles.ts                 # 46+ gêneros, 100+ características
│   └── const.ts                       # Constantes
│
├── docs/                              # Documentação completa
│   ├── README.md                      # Overview
│   ├── BACKEND.md                     # Arquitetura backend (2000+ linhas)
│   ├── FRONTEND.md                    # Arquitetura frontend (2000+ linhas)
│   ├── INSTALLATION.md                # Guia de instalação com Docker
│   ├── DEVELOPMENT.md                 # Histórico e roadmap
│   └── SKILLS.md                      # Documentação da skill incluída
│
├── skill-style-mixer/                 # Skill reutilizável
│   ├── SKILL.md                       # Documentação da skill
│   ├── scripts/
│   │   ├── generate_music_styles.py  # Gera banco de dados
│   │   └── validate_style_compatibility.py
│   ├── references/
│   │   ├── implementation-patterns.md # Padrões de código
│   │   └── preset-combinations.json   # 10 presets
│   └── templates/
│       └── StyleMixerComponent.tsx    # Componente pronto
│
└── todo.md                            # Histórico de desenvolvimento
```

## 🎯 Funcionalidades Implementadas

### 1. Lyrics Generator
Gera letras com suporte a 4 modos de voz, meta-tags estruturais e dinâmica.

### 2. Style & Prompt Generator
Mixer visual com 46+ gêneros, 100+ características, 40+ influências, 11 eras.

### 3. Full Song Creator
Combina letra e estilo em um único prompt para Suno AI.

### 4. Image Generator
Gera capas de álbum e artes visuais com IA.

### 5. Audio Lab
Experimenta com parâmetros de áudio (tempo, tonalidade, estrutura).

### 6. AI Chat Assistant
Chat especializado em música com histórico persistente.

### 7. Library
Histórico de gerações com busca, filtros e favoritos.

### 8. Explore
Galeria pública da comunidade com remix e inspiração.

### 9. Profile
Perfil do usuário com preferências persistentes.

### 10. Autenticação OAuth
Manus OAuth integrado com contexto persistente.

## 📊 Estatísticas

| Métrica | Valor |
|---------|-------|
| Testes Passando | 52 |
| Erros TypeScript | 0 |
| Gêneros Musicais | 46+ |
| Características | 100+ |
| Influências | 40+ |
| Presets | 10 |
| Linhas Frontend | ~3000 |
| Linhas Backend | ~1500 |
| Documentação | ~2000 |

## 🚀 Quick Start

### Com Docker (Recomendado)

```bash
# 1. Configure variáveis
cp ENV_EXAMPLE.md .env
nano .env

# 2. Inicie os containers
docker-compose up -d

# 3. Acesse
http://localhost:3000
```

### Local (Node.js)

```bash
# 1. Instale dependências
pnpm install

# 2. Configure banco
pnpm drizzle-kit migrate

# 3. Inicie servidor
pnpm dev

# 4. Acesse
http://localhost:3000
```

## 📚 Documentação

- **README.md** - Visão geral e features
- **docs/INSTALLATION.md** - Guia de instalação detalhado
- **docs/BACKEND.md** - Arquitetura backend, routers, database
- **docs/FRONTEND.md** - Componentes, hooks, padrões UI
- **docs/DEVELOPMENT.md** - Histórico, roadmap, contribuição
- **docs/SKILLS.md** - Como usar a skill incluída

## 🛠️ Tecnologias

**Frontend:** React 19, Tailwind CSS 4, tRPC, Vite, shadcn/ui
**Backend:** Express.js, tRPC, Drizzle ORM, MySQL
**DevOps:** Docker, Docker Compose, Node.js 22
**AI:** OpenAI LLM, Image Generation
**Auth:** Manus OAuth

## 🔧 Configuração Necessária

### Variáveis Obrigatórias

- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Chave para assinar JWTs
- `VITE_APP_ID` - OAuth application ID
- `BUILT_IN_FORGE_API_KEY` - API key

### Variáveis Opcionais

- `REDIS_URL` - Para caching (opcional)
- `VITE_ANALYTICS_*` - Para analytics (opcional)

## 📋 Pré-requisitos

### Docker
- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM
- 10GB espaço

### Local
- Node.js 22+
- pnpm 10+
- MySQL 8.0+
- 4GB RAM

## 🧪 Testes

```bash
# Rodar todos os testes
pnpm test

# Modo watch
pnpm test --watch

# Com cobertura
pnpm test --coverage
```

## 🔍 Verificação de Qualidade

```bash
# TypeScript
pnpm check

# Linting
pnpm format

# Build
pnpm build
```

## 📦 Deployment

```bash
# Build
pnpm build

# Start
NODE_ENV=production node dist/index.js
```

## 🎓 Próximos Passos

1. **Leia** `docs/INSTALLATION.md` para setup
2. **Explore** `docs/BACKEND.md` e `docs/FRONTEND.md`
3. **Customize** conforme necessário
4. **Teste** com `pnpm test`
5. **Deploy** usando Docker

## 🤝 Suporte

Para dúvidas:

1. Verifique `docs/INSTALLATION.md` para problemas de setup
2. Veja `docs/DEVELOPMENT.md` para roadmap e troubleshooting
3. Consulte `skill-style-mixer/SKILL.md` para usar a skill

## 📄 Licença

MIT License

---

**SunoForge v1.0.0**
Desenvolvido com ❤️ para criadores musicais

Data: 2026-05-12
