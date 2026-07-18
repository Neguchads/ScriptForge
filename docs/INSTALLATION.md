# SunoForge Installation Guide

## Requisitos

### Opção 1: Docker (Recomendado)
- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM mínimo
- 10GB espaço em disco

### Opção 2: Local (Node.js)
- Node.js 22+
- pnpm 10+
- MySQL 8.0+
- 4GB RAM
- 5GB espaço em disco

## Instalação com Docker

### 1. Clone ou Extraia o Projeto

```bash
# Se for um ZIP
unzip sunoforge.zip
cd sunoforge

# Se for um repositório Git
git clone <repository-url>
cd sunoforge
```

### 2. Configure as Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp ENV_EXAMPLE.md .env

# Edite o arquivo .env com seus valores
nano .env
```

**Valores importantes a alterar:**
- `JWT_SECRET`: Gere uma string aleatória forte
- `VITE_APP_ID`: Seu ID de aplicação OAuth
- `BUILT_IN_FORGE_API_KEY`: Sua chave de API
- `OWNER_OPEN_ID`: Seu ID OpenID

### 3. Inicie os Containers

```bash
# Inicie todos os serviços
docker-compose up -d

# Verifique o status
docker-compose ps

# Veja os logs
docker-compose logs -f app
```

### 4. Inicialize o Banco de Dados

```bash
# O banco é inicializado automaticamente
# Verifique se a migração foi aplicada
docker-compose exec mysql mysql -u sunoforge -p sunoforgepass sunoforge -e "SHOW TABLES;"
```

### 5. Acesse a Aplicação

Abra seu navegador e acesse:
```
http://localhost:3000
```

### Comandos Úteis

```bash
# Ver logs da aplicação
docker-compose logs -f app

# Ver logs do MySQL
docker-compose logs -f mysql

# Parar os containers
docker-compose down

# Remover volumes (cuidado: deleta dados)
docker-compose down -v

# Reconstruir a imagem
docker-compose build --no-cache

# Executar comando no container
docker-compose exec app pnpm test

# Acessar o MySQL
docker-compose exec mysql mysql -u sunoforge -p sunoforgepass sunoforge
```

## Instalação Local (Node.js)

### 1. Pré-requisitos

```bash
# Verifique as versões
node --version  # v22+
pnpm --version  # 10+

# Instale pnpm se necessário
npm install -g pnpm
```

### 2. Configure MySQL

```bash
# Inicie o MySQL (macOS com Homebrew)
brew services start mysql

# Ou no Linux
sudo systemctl start mysql

# Crie o banco de dados
mysql -u root -p -e "CREATE DATABASE sunoforge;"
mysql -u root -p -e "CREATE USER 'sunoforge'@'localhost' IDENTIFIED BY 'sunoforgepass';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON sunoforge.* TO 'sunoforge'@'localhost';"
```

### 3. Clone e Configure

```bash
# Clone o repositório
git clone <repository-url>
cd sunoforge

# Instale dependências
pnpm install

# Configure variáveis de ambiente
cp ENV_EXAMPLE.md .env
nano .env
```

### 4. Execute as Migrações

```bash
# Gere as migrações (se necessário)
pnpm drizzle-kit generate

# Aplique as migrações
pnpm drizzle-kit migrate
```

### 5. Inicie o Servidor

```bash
# Em um terminal
pnpm dev

# Em outro terminal (opcional, para monitorar)
pnpm test --watch
```

### 6. Acesse a Aplicação

```
http://localhost:3000
```

## Troubleshooting

### Erro: "Connection refused" ao MySQL

**Solução:**
```bash
# Verifique se MySQL está rodando
docker-compose ps mysql

# Se não estiver, reinicie
docker-compose restart mysql

# Aguarde alguns segundos e tente novamente
```

### Erro: "Port 3000 already in use"

**Solução:**
```bash
# Encontre o processo usando a porta
lsof -i :3000

# Mate o processo
kill -9 <PID>

# Ou use uma porta diferente
docker-compose up -d -p 3001:3000
```

### Erro: "Database connection failed"

**Solução:**
```bash
# Verifique a DATABASE_URL
echo $DATABASE_URL

# Teste a conexão
mysql -u sunoforge -p sunoforgepass -h localhost sunoforge

# Verifique os logs
docker-compose logs mysql
```

### Erro: "OAuth redirect_uri mismatch"

**Solução:**
1. Verifique `VITE_APP_ID` e `OAUTH_SERVER_URL`
2. Registre o callback URL correto em sua aplicação OAuth
3. Callback URL deve ser: `http://localhost:3000/api/oauth/callback`

### Erro: "LLM rate limit exceeded"

**Solução:**
1. Aguarde alguns minutos
2. Verifique sua quota de API
3. Implemente cache de respostas

### Erro: "Image generation failed"

**Solução:**
1. Verifique `BUILT_IN_FORGE_API_KEY`
2. Verifique se o serviço de imagens está disponível
3. Veja os logs: `docker-compose logs app`

## Configuração Avançada

### Usar Redis para Caching

```bash
# Inicie com Redis
docker-compose --profile with-redis up -d

# Configure em .env
REDIS_URL=redis://redis:6379
```

### Usar HTTPS Localmente

```bash
# Gere certificado auto-assinado
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365

# Configure no docker-compose.yml
environment:
  - NODE_ENV=development
  - SSL_CERT=/app/cert.pem
  - SSL_KEY=/app/key.pem
```

### Aumentar Limites de Memória

```bash
# No docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

## Backup e Restore

### Backup do Banco

```bash
# Backup completo
docker-compose exec mysql mysqldump -u sunoforge -p sunoforgepass sunoforge > backup.sql

# Backup com data
docker-compose exec mysql mysqldump -u sunoforge -p sunoforgepass sunoforge > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore do Banco

```bash
# Restore do backup
docker-compose exec -T mysql mysql -u sunoforge -p sunoforgepass sunoforge < backup.sql
```

## Performance Tuning

### MySQL

```sql
-- Aumentar max_connections
SET GLOBAL max_connections = 1000;

-- Aumentar innodb_buffer_pool_size
SET GLOBAL innodb_buffer_pool_size = 2147483648;

-- Adicionar índices
CREATE INDEX idx_userId ON generations(userId);
CREATE INDEX idx_createdAt ON generations(createdAt);
```

### Node.js

```bash
# Aumentar max listeners
NODE_OPTIONS="--max-old-space-size=4096" pnpm start
```

## Monitoramento

### Logs em Tempo Real

```bash
# Todos os serviços
docker-compose logs -f

# Apenas aplicação
docker-compose logs -f app

# Últimas 100 linhas
docker-compose logs --tail 100 app
```

### Health Checks

```bash
# Verifique saúde dos containers
docker-compose ps

# Teste manualmente
curl http://localhost:3000/health
```

## Segurança

### Antes de Produção

1. **Altere todas as senhas padrão**
   ```bash
   # Gere senhas fortes
   openssl rand -base64 32
   ```

2. **Configure HTTPS**
   ```bash
   # Use Let's Encrypt ou certificado válido
   ```

3. **Configure firewall**
   ```bash
   # Apenas exponha porta 443 (HTTPS)
   # Bloqueie 3306 (MySQL) e 6379 (Redis)
   ```

4. **Atualize dependências**
   ```bash
   pnpm update
   ```

5. **Configure rate limiting**
   ```bash
   # Implemente em server/_core/index.ts
   ```

## Próximos Passos

1. Configure seu domínio
2. Configure SSL/TLS
3. Configure backup automático
4. Configure monitoramento e alertas
5. Configure CI/CD pipeline

---

Para mais ajuda, veja [DEVELOPMENT.md](./DEVELOPMENT.md)
