# ADRs

Decisões de arquitetura e técnicas tomadas durante o desenvolvimento.

## Stack

- **Runtime:** Node.js 24 (LTS)
- **Linguagem:** TypeScript 5 + módulos NodeNext
- **API:** Fastify 5 + Zod
- **Banco:** PostgreSQL 17
- **DB Client:** `postgres` v3 (Laurin Quast)
- **Frontend:** Next.js 16 (App Router) + React 19
- **Testes:** Vitest 2

---

## Arquitetura

**Backend** 

- Em alguns pontos optamos por utilizar DIP para desacoplar o código, principalmente na camada de interação com o banco de dados, já que a ideia é em produção poder trocá-lo facilmente.
- O mesmo foi feito para a questão do SSE Manager.
- As implementações concretas foram montadas nos plugins do Fastify utilizando Composition Root (uma único arquivo de entrada)

**Frontend**
- Segue Feature Slice Design (FSD), onde cada feature possui suas pastas `model/`, `api/`, `hooks/` e `ui/`
- Features não importam umas das outras (tipos compartilhados ficam em `shared/`)
- Pages são orquestradores simples e toda a lógica de negócio vive nos hooks
---

## Concorrência e Idempotência

### Idempotência

Todo request `POST /api/events` carrega um `external_id`. A tabela `events` tem uma constraint `UNIQUE` em `external_id`. O service:

1. Abre uma transação via `sql.begin()`
2. Primeiro verifica `findByExternalId` — se encontrado, retorna imediatamente com `idempotent: true`
3. Se não encontrado, prossegue com o insert

Isso garante inserção at-most-once mesmo sob retentativas de rede. A resposta HTTP é `200 OK` para duplicatas vs `201 Created` para novos eventos, facilitando a distinção pelo cliente.

### Rece conditions (SELECT FOR UPDATE)

1. `SELECT ... FOR UPDATE` na linha da entidade — adquire um lock no nível de linha
2. Verifica se já está suspensa → 422 se sim
3. Insere o evento
4. Incrementa os contadores
5. Verifica se o contador atingiu `SUSPENSION_THRESHOLD`
6. Se sim, define `status = 'suspended'`

Todos os 6 passos executam dentro de uma única transação. `SELECT FOR UPDATE` garante que dois requests concorrentes para a mesma entidade não possam ambos ler o mesmo contador e ambos decidir suspender. A última escrita vence com segurança porque apenas uma transação detém o lock de linha por vez.

---

## Streaming (SSE)

### Arquitetura

```
Cliente                  Frontend               API                    PostgreSQL
  │                          │                   │                         │
  │── GET /api/events/stream ─▶                  │                         │
  │                          │── EventSource ───▶│                         │
  │                          │                   │── sql.listen ──────────▶│
  │                          │                   │   'new_event'           │
  │                          │                   │                         │
  │   (evento registrado) ───────────────────────▶── INSERT events ───────▶│
  │                          │                   │                         │
  │                          │                   │◀── pg_notify ──────────│
  │                          │                   │   'new_event', payload  │
  │                          │                   │                         │
  │                          │◀── data: {event} ─│                         │
  │◀── MessageEvent ─────────│                   │                         │
```

A API abre uma única conexão `LISTEN` no PostgreSQL por instância do `SseManager`. Todos os clientes SSE conectados àquele nó da API recebem a notificação via `broadcastRaw`. Isso é mais eficiente do que um LISTEN por cliente SSE.

### `pg_notify` dentro de uma transação

`pg_notify` é chamado dentro da transação do `INSERT`. O PostgreSQL só envia a notificação _após o commit_, o que significa que clientes nunca recebem um evento que foi revertido.

### Reconexão

O hook `useSSE` do frontend implementa backoff exponencial: `1s → 2s → 4s → … → 30s` (limite). Isso previne *thundering herd* em reinicializações do servidor, ou seja, quando o servidor reinicia, todos os clientes desconectam ao mesmo tempo e, sem backoff, tentariam reconectar simultaneamente, sobrecarregando o servidor logo na inicialização. O backoff exponencial espalha as tentativas no tempo, evitando esse pico.

---

## Performance

### Cache do ranking

`GET /api/entities/ranking` executa um JOIN com agregação sobre até 7 dias de eventos, o que é inerentemente custoso. O resultado é cacheado no processo com `node-cache` pelo tempo `RANKING_CACHE_TTL_MS` (padrão: 60s). O cache é invalidado a cada chamada de `createEvent` para garantir atualização após bursts de alta atividade.

Um **índice parcial** na tabela `events` acelera a query de ranking:

```sql
CREATE INDEX idx_events_critical_created ON events(entity_id, created_at)
WHERE type = 'critical';
```

O planner usa esse índice para evitar full table scans ao filtrar por tipo e intervalo de tempo.

### Índices do banco de dados

| Tabela   | Índice                                   | Finalidade                  |
| -------- | ---------------------------------------- | --------------------------- |
| entities | `idx_entities_status`                    | Filtro por status           |
| events   | `idx_events_entity_id`                   | Join por FK                 |
| events   | `idx_events_critical_created` (parcial)  | Agregação do ranking        |
| events   | `UNIQUE(external_id)` (B-tree implícito) | Verificação de idempotência |

---

## Em produção:

1. **Monorepo de tipos compartilhados** 
  - Extrair os DTOs da API para um pacote `packages/shared` consumido tanto por `api/` quanto por `frontend/`. Elimina a duplicação manual de tipos atual.

2. **Escala horizontal do SSE** 
  — O `SseManager` atual está dentro do processo. Com múltiplas réplicas da API, clientes em nós diferentes não recebem os eventos uns dos outros. Em produção, substituir por Redis `SUBSCRIBE` ou um message broker como barramento de fan-out.

3. **Cache server-side do endpoint de ranking** 
  — Migrar do `node-cache` em processo para Redis com TTL distribuído, para que todas as réplicas da API compartilhem o mesmo valor cacheado (em se tratando de mais de uma instância da API).

4. **Autenticação e autorização** 
  — Adicionar JWT ou API keys. O endpoint `POST /api/events` deve ser autenticado para prevenir flooding de eventos.

5. **Rate limiting** 
  — Usar `@fastify/rate-limit` por IP e por entidade para proteger o threshold de suspensão de abusos.

6. **Observabilidade** 
  — Adicionar logging estruturado com Pino, traces OpenTelemetry e um endpoint de métricas (`/metrics` em formato Prometheus) para alertas sobre altas taxas de eventos críticos.

7. **Ferramenta de migrations**
  - Substituir a abordagem de shell scripts em `docker-entrypoint-initdb.d` por `node-pg-migrate` ou algum ORM, como Drizzle para migrations versionadas com suporte a rollback em pipelines de CI/CD.

8. **Testes de integração para SSE**
  - Testar o fluxo completo `pg_notify → SSE` com banco real no CI usando `supertest` + um cliente `EventSource` customizado.
