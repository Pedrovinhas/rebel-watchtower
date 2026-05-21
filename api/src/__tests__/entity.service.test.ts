import { describe, it, expect, beforeEach } from 'vitest';
import { EntityService } from '../services/entity.service.js';
import { FakeEntityDAO } from './fakes/FakeEntityDAO.js';
import { AppError } from '../errors.js';

describe('EntityService', () => {
  let entityRepo: FakeEntityDAO;
  let service: EntityService;

  beforeEach(() => {
    entityRepo = new FakeEntityDAO();
    service = new EntityService(entityRepo);
  });

  describe('createEntity', () => {
    it('creates an entity with active status', async () => {
      const entity = await service.createEntity({ name: 'Alderaan' });

      expect(entity.name).toBe('Alderaan');
      expect(entity.status).toBe('active');
      expect(entity.critical_events_count).toBe(0);
      expect(entity.total_events_count).toBe(0);
    });

    it('throws 409 when name already exists', async () => {
      await service.createEntity({ name: 'Alderaan' });

      await expect(service.createEntity({ name: 'Alderaan' })).rejects.toThrow(
        AppError,
      );

      const err = await service
        .createEntity({ name: 'Alderaan' })
        .catch((e: AppError) => e);
      expect((err as AppError).httpStatus).toBe(409);
      expect((err as AppError).code).toBe('entity_name_conflict');
    });
  });

  describe('listEntities', () => {
    it('returns entities with pagination metadata', async () => {
      await service.createEntity({ name: 'Alderaan' });
      await service.createEntity({ name: 'Yavin IV' });

      const result = await service.listEntities(1, 10);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.pages).toBe(1);
    });
  });
});
