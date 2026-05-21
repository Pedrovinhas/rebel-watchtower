import { describe, it, expect } from 'vitest';
import sql from '../db.js';
import { EntityDAO } from '../dao/entity.dao.js';
import { EventDAO } from '../dao/event.dao.js';
import { EventService } from '../services/event.service.js';

describe('EventService — concurrency & idempotency (integration)', () => {
  it('creates exactly one event when N concurrent requests share the same external_id', async () => {
    const entityDao = new EntityDAO(sql);
    const eventDao = new EventDAO(sql);
    const service = new EventService(sql, entityDao, eventDao);

    const entity = await entityDao.insert('Concurrency Test Entity');

    const CONCURRENCY = 10;
    const results = await Promise.allSettled(
      Array.from({ length: CONCURRENCY }, (_, i) =>
        service.createEvent({
          entityId: entity.id,
          externalId: 'concurrent-ext-001',
          severity: 'info',
          payload: { attempt: i },
        }),
      ),
    );

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(rejected).toHaveLength(0);

    const newEvents = fulfilled.filter(
      (r) => r.status === 'fulfilled' && !r.value.idempotent,
    );
    expect(newEvents).toHaveLength(1);

    const duplicates = fulfilled.filter(
      (r) => r.status === 'fulfilled' && r.value.idempotent === true,
    );
    expect(duplicates).toHaveLength(CONCURRENCY - 1);

    const [{ count }] = await sql<[{ count: string }]>`
      SELECT COUNT(*)::text AS count FROM events WHERE external_id = 'concurrent-ext-001'
    `;
    expect(Number(count)).toBe(1);
  });

  it('does not suspend entity when concurrent critical events would exceed threshold only once', async () => {
    const entityDao = new EntityDAO(sql);
    const eventDao = new EventDAO(sql);
    const service = new EventService(sql, entityDao, eventDao);

    const entity = await entityDao.insert('Suspension Race Entity');

    await Promise.all([
      service.createEvent({ entityId: entity.id, externalId: 'race-crit-1', severity: 'critical', payload: {} }),
      service.createEvent({ entityId: entity.id, externalId: 'race-crit-2', severity: 'critical', payload: {} }),
    ]);

    const [{ count }] = await sql<[{ count: string }]>`
      SELECT COUNT(*)::text AS count FROM events WHERE entity_id = ${entity.id}
    `;
    expect(Number(count)).toBe(2);

    const [updated] = await sql<[{ critical_events_count: number }]>`
      SELECT critical_events_count FROM entities WHERE id = ${entity.id}
    `;
    expect(updated!.critical_events_count).toBe(2);
  });
});
