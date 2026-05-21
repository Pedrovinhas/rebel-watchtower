import NodeCache from 'node-cache';
import type { Sql } from '../db.js';
import type { IEntityDAO } from '../dao/interfaces/IEntityDAO.js';
import type { IEventDAO, Event, RankingEntry } from '../dao/interfaces/IEventDAO.js';
import { AppError } from '../errors.js';
import { config } from '../config.js';

export interface CreateEventDto {
  entityId: number;
  externalId: string;
  severity: 'info' | 'warning' | 'critical';
  payload: Record<string, unknown>;
}

export interface CreateEventResult extends Event {
  idempotent?: boolean;
}

export class EventService {
  private readonly cache = new NodeCache({
    stdTTL: config.RANKING_CACHE_TTL_MS / 1000,
  });

  constructor(
    private readonly sql: Sql,
    private readonly entities: IEntityDAO,
    private readonly events: IEventDAO,
  ) {}

  async createEvent(dto: CreateEventDto): Promise<CreateEventResult> {
    return this.sql.begin(async (tx) => {
      const existing = await this.events.findByExternalId(tx, dto.externalId);
      if (existing) {
        return { ...existing, idempotent: true as const };
      }

      const entity = await this.entities.findForUpdate(tx, dto.entityId);

      if (entity.status === 'suspended') {
        throw new AppError(
          'entity_suspended',
          422,
          'Entity is suspended and cannot accept new events',
        );
      }

      const event = await this.events.insert(tx, dto);

      await tx.notify('new_event', JSON.stringify({ ...event, entity_name: entity.name }));

      await this.entities.incrementCounters(tx, dto.entityId, dto.severity);

      if (
        dto.severity === 'critical' &&
        entity.critical_events_count + 1 >= config.SUSPENSION_THRESHOLD
      ) {
        await this.entities.suspend(tx, dto.entityId);
      }

      // Invalidate ranking cache
      this.cache.flushAll();

      return event;
    });
  }

  async getRanking(limit = 10): Promise<RankingEntry[]> {
    const cacheKey = `ranking:${limit}`;
    const cached = this.cache.get<RankingEntry[]>(cacheKey);
    if (cached) return cached;

    const result = await this.events.getRanking(limit);
    this.cache.set(cacheKey, result);
    return result;
  }
}
