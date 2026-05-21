import type { Tx } from '../../db.js';

export type Severity = 'info' | 'warning' | 'critical';

export interface Entity {
  id: number;
  name: string;
  status: 'active' | 'suspended';
  critical_events_count: number;
  total_events_count: number;
  last_event_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface ListEntitiesFilters {
  status?: 'active' | 'suspended';
  search?: string;
}

export interface IEntityDAO {
  insert(name: string): Promise<Entity>;
  findByName(name: string): Promise<Entity | null>;
  list(page: number, limit: number, filters?: ListEntitiesFilters): Promise<{ data: Entity[]; total: number }>;

  findById(tx: Tx, id: number): Promise<Entity | null>;
  findForUpdate(tx: Tx, id: number): Promise<Entity>;
  incrementCounters(tx: Tx, id: number, severity: Severity): Promise<void>;
  suspend(tx: Tx, id: number): Promise<void>;
}
