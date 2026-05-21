import type postgres from 'postgres';
import type { EntityService } from '../services/entity.service.js';
import type { EventService } from '../services/event.service.js';
import type { IEntityDAO } from '../dao/interfaces/IEntityDAO.js';
import type { IEventDAO } from '../dao/interfaces/IEventDAO.js';
import type { SseManager } from '../streaming/sse-manager.js';

declare module 'fastify' {
  interface FastifyInstance {
    sql: postgres.Sql;
    dao: {
      entity: IEntityDAO;
      event: IEventDAO;
    };
    services: {
      entity: EntityService;
      event: EventService;
    };
    sse: SseManager;
  }
}
