import type { IEntityDAO, Entity, Severity, ListEntitiesFilters } from '../../dao/interfaces/IEntityDAO.js';
import type { Tx } from '../../db.js';
import { AppError } from '../../errors.js';

export class FakeEntityDAO implements IEntityDAO {
  public store: Entity[] = [];
  private nextId = 1;

  async insert(name: string): Promise<Entity> {
    const entity: Entity = {
      id: this.nextId++,
      name,
      status: 'active',
      critical_events_count: 0,
      total_events_count: 0,
      last_event_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.store.push(entity);
    return entity;
  }

  async findByName(name: string): Promise<Entity | null> {
    return this.store.find((e) => e.name === name) ?? null;
  }

  async list(
    _page: number,
    _limit: number,
    filters: ListEntitiesFilters = {},
  ): Promise<{ data: Entity[]; total: number }> {
    let results = [...this.store];
    if (filters.status) results = results.filter((e) => e.status === filters.status);
    if (filters.search) results = results.filter((e) => e.name.toLowerCase().includes(filters.search!.toLowerCase()));
    return { data: results, total: results.length };
  }

  async findById(_tx: Tx, id: number): Promise<Entity | null> {
    return this.store.find((e) => e.id === id) ?? null;
  }

  async findForUpdate(_tx: Tx, id: number): Promise<Entity> {
    const entity = this.store.find((e) => e.id === id);
    if (!entity) throw new AppError('entity_not_found', 404);
    return entity;
  }

  async incrementCounters(
    _tx: Tx,
    id: number,
    severity: Severity,
  ): Promise<void> {
    const entity = this.store.find((e) => e.id === id)!;
    entity.total_events_count++;
    if (severity === 'critical') entity.critical_events_count++;
    entity.last_event_at = new Date();
    entity.updated_at = new Date();
  }

  async suspend(_tx: Tx, id: number): Promise<void> {
    const entity = this.store.find((e) => e.id === id)!;
    entity.status = 'suspended';
    entity.updated_at = new Date();
  }
}
