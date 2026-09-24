# Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto (ele já está no `.gitignore`) com o conteúdo abaixo.
Nunca commite chaves ou senhas.

```env
# --- Obrigatórias ---

# Banco MySQL/TiDB (veja docs/DATABASE_SETUP.md para criar um TiDB Cloud grátis)
DATABASE_URL=mysql://USUARIO.prefixo:SENHA@HOST:4000/test?ssl={"rejectUnauthorized":true}

# Assina o cookie de sessão do login local. Gere um valor aleatório:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=troque-por-um-valor-aleatorio-longo

# Identificador interno da sessão local (qualquer texto não vazio)
VITE_APP_ID=scriptforge-local

# --- IA de texto (Gemini, grátis) ---

# Chave grátis em https://aistudio.google.com/apikey
BUILT_IN_FORGE_API_URL=https://generativelanguage.googleapis.com/v1beta/openai
BUILT_IN_FORGE_API_KEY=sua-chave-gemini

# Opcional: modelo usado. Padrão: gemini-2.5-flash-lite (o mais estável no plano grátis).
# Modelos maiores (gemini-flash-latest, 3.x) dão mais qualidade, mas no plano grátis
# ficam lentos ou dão erro 503 com frequência.
# LLM_MODEL=gemini-flash-latest

# --- Opcionais ---

# Porta do servidor (padrão 3000; se ocupada, usa a próxima livre)
# PORT=3000

# YouTube Manager (exige projeto no Google Cloud com YouTube Data API v3).
# Redirect URI a autorizar: <sua-origem>/api/youtube/oauth/callback
# YOUTUBE_CLIENT_ID=
# YOUTUBE_CLIENT_SECRET=

# Promove um usuário a admin no login OAuth (não afeta cadastro local)
# OWNER_OPEN_ID=
```

## Observações

- **Login:** é local (e-mail e senha guardados no seu próprio banco). Não depende de serviço externo.
- **Imagens:** geradas via Pollinations.ai (sem chave) e salvas na pasta `uploads/`, servida em `/uploads`.
- **Windows:** variáveis definidas no sistema também funcionam, mas o `.env` é mais simples e fica só neste projeto.
