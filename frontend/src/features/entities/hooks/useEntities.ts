'use client';

import { useState, useEffect, useCallback } from 'react';
import { getEntities } from '../api/entities.api';
import type { Entity } from '../model/types';
import type { ApiResponse } from '@/shared/types/api';

interface EntityFilters {
  status?: 'active' | 'suspended';
  search?: string;
}

interface UseEntitiesState {
  data: ApiResponse<Entity> | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useEntities(page = 1, limit = 20, filters: EntityFilters = {}): UseEntitiesState {
  const [data, setData] = useState<ApiResponse<Entity> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getEntities(page, limit, filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entities');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, filters.status, filters.search]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}
