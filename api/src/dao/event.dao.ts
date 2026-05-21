import type { Sql, Tx } from '../db.js';
import type {
  IEventDAO,
  Event,
  InsertEventDto,
  RankingEntry,
  EventWithEntity,
} from './interfaces/IEventDAO.js';

export class EventDAO implements IEventDAO {
  constructor(private readonly sql: Sql) {}

  async insert(tx: Tx, dto: InsertEventDto): Promise<Event> {
    const [event] = await tx<Event[]>`
      INSERT INTO events (entity_id, external_id, type, payload)
      VALUES (${dto.entityId}, ${dto.externalId}, ${dto.severity}, ${tx.json(dto.payload as unknown as Parameters<Tx['json']>[0])})
      RETURNING *
    `;

    return event!;
  }

  async findByExternalId(tx: Tx, externalId: string): Promise<Event | null> {
    const [event] = await tx<Event[]>`
      SELECT * FROM events WHERE external_id = ${externalId}
    `;
    return event ?? null;
  }

  async getRanking(limit: number): Promise<RankingEntry[]> {
    return this.sql<RankingEntry[]>`
      SELECT
        e.id          AS entity_id,
        e.name        AS entity_name,
        COUNT(ev.id)  AS critical_count
      FROM entities e
      JOIN events ev
        ON ev.entity_id = e.id
       AND ev.type = 'critical'
       AND ev.created_at >= NOW() - INTERVAL '7 days'
      GROUP BY e.id, e.name
      ORDER BY critical_count DESC
      LIMIT ${limit}
    `;
  }

  async getRecent(limit: number): Promise<EventWithEntity[]> {
    return this.sql<EventWithEntity[]>`
      SELECT ev.*, e.name AS entity_name
      FROM events ev
      JOIN entities e ON e.id = ev.entity_id
      ORDER BY ev.created_at DESC
      LIMIT ${limit}
    `;
  }
}
