# Rebel Watchtower

Sistema fullstack de monitoramento para rastreamento de entidades e eventos em tempo real cnstruído com Node.js 24 + Fastify + PostgreSQL 17 + Next.js 16, containerizado com Docker.

Para decisões de arquitetura e técnicas, veja [docs/adrs.md](docs/adrs.md).

---

## Como Executar

### Pré-requisitos

- Docker + Docker Compose
- Make (opcional - veja os comandos Docker abaixo caso não esteja disponível)

### Com Make

```bash
# Copiar arquivos de env (apenas na primeira vez)
make setup

# Construir e iniciar todos os serviços
make up
```

### Sem Make

```bash
# Copiar arquivos de env (apenas na primeira vez)
cp api/.env.example api/.env
cp frontend/.env.example frontend/.env

# Construir e iniciar todos os serviços
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

| Serviço  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:3001 |
| API      | http://localhost:3000 |

### Executar testes do backend

```bash
# Make
make test

# Docker
docker compose -f docker-compose.yml -f docker-compose.dev.yml run --rm api npm test
```

### Executar testes do frontend

```bash
# Make
make test-frontend

# Docker
docker compose -f docker-compose.yml -f docker-compose.dev.yml run --rm frontend npm test
```

### Outros comandos úteis

| Ação                           | Make                  | Docker                                                                                |
| ------------------------------ | --------------------- | ------------------------------------------------------------------------------------- |
| Parar containers               | `make down`           | `docker compose -f docker-compose.yml -f docker-compose.dev.yml down`                 |
| Reconstruir imagens            | `make build`          | `docker compose -f docker-compose.yml build`                                          |
| Shell no container da API      | `make shell-api`      | `docker compose -f docker-compose.yml -f docker-compose.dev.yml run --rm api sh`      |
| Shell no container do frontend | `make shell-frontend` | `docker compose -f docker-compose.yml -f docker-compose.dev.yml run --rm frontend sh` |
| Acompanhar logs                | `make logs`           | `docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f`              |
