import type {
  IEventDAO,
  Event,
  InsertEventDto,
  RankingEntry,
  EventWithEntity,
} from '../../dao/interfaces/IEventDAO.js';
import type { Tx } from '../../db.js';

export class FakeEventDAO implements IEventDAO {
  public store: Event[] = [];
  private nextId = 1;

  async insert(_tx: Tx, dto: InsertEventDto): Promise<Event> {
    const event: Event = {
      id: this.nextId++,
      entity_id: dto.entityId,
      external_id: dto.externalId,
      type: dto.severity,
      payload: dto.payload,
      created_at: new Date(),
    };
    this.store.push(event);
    return event;
  }

  async findByExternalId(_tx: Tx, externalId: string): Promise<Event | null> {
    return this.store.find((e) => e.external_id === externalId) ?? null;
  }

  async getRanking(_limit: number): Promise<RankingEntry[]> {
    return [];
  }

  async getRecent(_limit: number): Promise<EventWithEntity[]> {
    return [];
  }
}
