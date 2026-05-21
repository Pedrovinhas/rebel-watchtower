import type { Tx } from '../../db.js';
import type { Severity } from './IEntityDAO.js';

export interface Event {
  id: number;
  entity_id: number;
  external_id: string;
  type: 'info' | 'warning' | 'critical';
  payload: Record<string, unknown>;
  created_at: Date;
}

export interface InsertEventDto {
  entityId: number;
  externalId: string;
  severity: Severity;
  payload: Record<string, unknown>;
}

export interface RankingEntry {
  entity_id: number;
  entity_name: string;
  critical_count: number;
}

export interface EventWithEntity extends Event {
  entity_name: string;
}

export interface IEventDAO {
  insert(tx: Tx, dto: InsertEventDto): Promise<Event>;
  findByExternalId(tx: Tx, externalId: string): Promise<Event | null>;
  getRanking(limit: number): Promise<RankingEntry[]>;
  getRecent(limit: number): Promise<EventWithEntity[]>;
}
