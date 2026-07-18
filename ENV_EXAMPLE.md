# Environment Variables Example

Copy this to `.env` file and fill in your values.

```env
# Database
DATABASE_URL=mysql://sunoforge:sunoforgepass@localhost:3306/sunoforge

# MySQL
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=sunoforge
MYSQL_USER=sunoforge
MYSQL_PASSWORD=sunoforgepass

# Environment
NODE_ENV=development

# Auth & OAuth
JWT_SECRET=your-jwt-secret-key-change-in-production
VITE_APP_ID=your-oauth-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im

# API Keys
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# Owner Info
OWNER_NAME=Owner
OWNER_OPEN_ID=owner-id

# App Config
VITE_APP_TITLE=SunoForge
VITE_APP_LOGO=/logo.png

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

## Descrição das Variáveis

### Database
- `DATABASE_URL`: Connection string do MySQL

### MySQL (Docker)
- `MYSQL_ROOT_PASSWORD`: Senha do root
- `MYSQL_DATABASE`: Nome do banco
- `MYSQL_USER`: Usuário do banco
- `MYSQL_PASSWORD`: Senha do usuário

### Auth
- `JWT_SECRET`: Chave para assinar JWTs (use valor aleatório forte)
- `VITE_APP_ID`: ID da aplicação OAuth
- `OAUTH_SERVER_URL`: URL do servidor OAuth
- `VITE_OAUTH_PORTAL_URL`: URL do portal de login

### API Keys
- `BUILT_IN_FORGE_API_URL`: URL da API Manus
- `BUILT_IN_FORGE_API_KEY`: Chave da API (backend)
- `VITE_FRONTEND_FORGE_API_KEY`: Chave da API (frontend)
- `VITE_FRONTEND_FORGE_API_URL`: URL da API (frontend)

### Owner
- `OWNER_NAME`: Nome do proprietário
- `OWNER_OPEN_ID`: ID OpenID do proprietário

### App
- `VITE_APP_TITLE`: Título da aplicação
- `VITE_APP_LOGO`: URL do logo

### Analytics (Opcional)
- `VITE_ANALYTICS_ENDPOINT`: Endpoint de analytics
- `VITE_ANALYTICS_WEBSITE_ID`: ID do website para analytics
