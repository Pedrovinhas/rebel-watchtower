import type { Sql, Tx } from '../db.js';
import type { IEntityDAO, Entity, Severity, ListEntitiesFilters } from './interfaces/IEntityDAO.js';
import { AppError } from '../errors.js';

export class EntityDAO implements IEntityDAO {
  constructor(private readonly sql: Sql) {}

  async insert(name: string): Promise<Entity> {
    const [entity] = await this.sql<Entity[]>`
      INSERT INTO entities (name)
      VALUES (${name})
      RETURNING *
    `;
    return entity!;
  }

  async findByName(name: string): Promise<Entity | null> {
    const [entity] = await this.sql<Entity[]>`
      SELECT * FROM entities WHERE name = ${name}
    `;
    return entity ?? null;
  }

  async list(
    page: number,
    limit: number,
    filters: ListEntitiesFilters = {},
  ): Promise<{ data: Entity[]; total: number }> {
    const offset = (page - 1) * limit;
    const { status, search } = filters;

    const [{ total }] = await this.sql<[{ total: string }]>`
      SELECT COUNT(*)::text AS total FROM entities
      WHERE TRUE
        ${status ? this.sql`AND status = ${status}` : this.sql``}
        ${search ? this.sql`AND name ILIKE ${'%' + search + '%'}` : this.sql``}
    `;
    const data = await this.sql<Entity[]>`
      SELECT * FROM entities
      WHERE TRUE
        ${status ? this.sql`AND status = ${status}` : this.sql``}
        ${search ? this.sql`AND name ILIKE ${'%' + search + '%'}` : this.sql``}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return { data, total: Number(total) };
  }

  async findById(tx: Tx, id: number): Promise<Entity | null> {
    const [entity] = await tx<Entity[]>`
      SELECT * FROM entities WHERE id = ${id}
    `;
    return entity ?? null;
  }

  async findForUpdate(tx: Tx, id: number): Promise<Entity> {
    const [entity] = await tx<Entity[]>`
      SELECT * FROM entities WHERE id = ${id} FOR UPDATE
    `;
    if (!entity) throw new AppError('entity_not_found', 404);
    return entity;
  }

  async incrementCounters(
    tx: Tx,
    id: number,
    severity: Severity,
  ): Promise<void> {
    await tx`
      UPDATE entities
      SET
        total_events_count    = total_events_count + 1,
        critical_events_count = critical_events_count + CASE WHEN ${severity} = 'critical' THEN 1 ELSE 0 END,
        last_event_at         = NOW(),
        updated_at            = NOW()
      WHERE id = ${id}
    `;
  }

  async suspend(tx: Tx, id: number): Promise<void> {
    await tx`
      UPDATE entities
      SET status = 'suspended', updated_at = NOW()
      WHERE id = ${id}
    `;
  }
}
