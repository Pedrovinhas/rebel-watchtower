export interface Event {
  id: number;
  entity_id: number;
  entity_name?: string;
  external_id: string;
  type: 'info' | 'warning' | 'critical';
  payload: Record<string, unknown>;
  created_at: string;
  idempotent?: boolean;
}
