import { http } from '@/shared/lib/http';
import type { ApiResponse } from '@/shared/types/api';
import type { Entity } from '../model/types';

export interface ListEntitiesParams {
  page?: number;
  limit?: number;
  status?: 'active' | 'suspended';
  search?: string;
}

export async function getEntities(
  page = 1,
  limit = 20,
  filters: Pick<ListEntitiesParams, 'status' | 'search'> = {},
): Promise<ApiResponse<Entity>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters.status) params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);
  return http<ApiResponse<Entity>>(`/api/entities?${params.toString()}`);
}

export async function createEntity(name: string): Promise<Entity> {
  return http<Entity>('/api/entities', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}
