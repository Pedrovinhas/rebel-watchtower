import { describe, it, expect, beforeEach } from 'vitest';
import { EventService } from '../services/event.service.js';
import { FakeEntityDAO } from './fakes/FakeEntityDAO.js';
import { FakeEventDAO } from './fakes/FakeEventDAO.js';
import { AppError } from '../errors.js';
import type { Sql, Tx } from '../db.js';
import type { Entity } from '../dao/interfaces/IEntityDAO.js';
import { config } from '../config.js';

const mockSql = {
  begin: async <T>(
    fn: (tx: Tx) => Promise<T>,
  ): Promise<T> => fn(null as unknown as Tx),
} as unknown as Sql;

const makeEntity = (overrides: Partial<Entity> = {}): Entity => ({
  id: 1,
  name: 'Alderaan',
  status: 'active',
  critical_events_count: 0,
  total_events_count: 0,
  last_event_at: null,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

describe('EventService', () => {
  let entityRepo: FakeEntityDAO;
  let eventRepo: FakeEventDAO;
  let service: EventService;

  beforeEach(() => {
    entityRepo = new FakeEntityDAO();
    eventRepo = new FakeEventDAO();
    service = new EventService(mockSql, entityRepo, eventRepo);
  });

  describe('createEvent — idempotency', () => {
    it('returns existing event with idempotent flag on duplicate external_id', async () => {
      entityRepo.store.push(makeEntity({ id: 1 }));
      await service.createEvent({
        entityId: 1,
        externalId: 'evt-001',
        severity: 'info',
        payload: {},
      });

      const result = await service.createEvent({
        entityId: 1,
        externalId: 'evt-001',
        severity: 'info',
        payload: {},
      });

      expect(result.idempotent).toBe(true);
      expect(eventRepo.store).toHaveLength(1);
    });
  });

  describe('createEvent — suspension', () => {
    it('suspends entity when critical events reach threshold', async () => {
      entityRepo.store.push(
        makeEntity({
          id: 1,
          critical_events_count: config.SUSPENSION_THRESHOLD - 1,
        }),
      );

      await service.createEvent({
        entityId: 1,
        externalId: 'evt-critical',
        severity: 'critical',
        payload: {},
      });

      expect(entityRepo.store[0]!.status).toBe('suspended');
    });

    it('does not suspend when critical count is below threshold', async () => {
      entityRepo.store.push(
        makeEntity({
          id: 1,
          critical_events_count: config.SUSPENSION_THRESHOLD - 2,
        }),
      );

      await service.createEvent({
        entityId: 1,
        externalId: 'evt-001',
        severity: 'critical',
        payload: {},
      });

      expect(entityRepo.store[0]!.status).toBe('active');
    });

    it('rejects event for suspended entity with 422', async () => {
      entityRepo.store.push(
        makeEntity({ id: 1, status: 'suspended' }),
      );

      const err = await service
        .createEvent({
          entityId: 1,
          externalId: 'evt-new',
          severity: 'info',
          payload: {},
        })
        .catch((e) => e);

      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).httpStatus).toBe(422);
      expect((err as AppError).code).toBe('entity_suspended');
    });
  });

  describe('createEvent — counters', () => {
    it('increments critical_events_count only for critical events', async () => {
      entityRepo.store.push(makeEntity({ id: 1 }));

      await service.createEvent({
        entityId: 1,
        externalId: 'info-1',
        severity: 'info',
        payload: {},
      });
      await service.createEvent({
        entityId: 1,
        externalId: 'warn-1',
        severity: 'warning',
        payload: {},
      });

      expect(entityRepo.store[0]!.total_events_count).toBe(2);
      expect(entityRepo.store[0]!.critical_events_count).toBe(0);
    });

    it('increments both counters for critical event', async () => {
      entityRepo.store.push(makeEntity({ id: 1 }));

      await service.createEvent({
        entityId: 1,
        externalId: 'crit-1',
        severity: 'critical',
        payload: {},
      });

      expect(entityRepo.store[0]!.total_events_count).toBe(1);
      expect(entityRepo.store[0]!.critical_events_count).toBe(1);
    });
  });

  describe('createEvent — entity not found', () => {
    it('throws 404 when entity does not exist', async () => {
      const err = await service
        .createEvent({
          entityId: 99,
          externalId: 'evt-x',
          severity: 'info',
          payload: {},
        })
        .catch((e) => e);

      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).httpStatus).toBe(404);
    });
  });
});
