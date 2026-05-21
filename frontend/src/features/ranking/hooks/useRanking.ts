'use client';

import { useState, useEffect, useCallback } from 'react';
import { getRanking } from '../api/ranking.api';
import type { RankingEntry } from '../model/types';

const REFRESH_INTERVAL_MS = 60_000;

interface UseRankingState {
  data: RankingEntry[];
  loading: boolean;
  error: string | null;
}

export function useRanking(): UseRankingState {
  const [data, setData] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      const result = await getRanking();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ranking');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetch]);

  return { data, loading, error };
}
