export interface Entity {
  id: number;
  name: string;
  status: 'active' | 'suspended';
  critical_events_count: number;
  total_events_count: number;
  last_event_at: string | null;
  created_at: string;
  updated_at: string;
}
