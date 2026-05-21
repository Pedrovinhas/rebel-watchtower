import { http } from '@/shared/lib/http';
import type { Event } from '../model/types';

export async function registerEvent(data: {
  entity_id: number;
  external_id: string;
  severity: 'info' | 'warning' | 'critical';
  payload: Record<string, unknown>;
}): Promise<Event> {
  return http<Event>('/api/events', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
