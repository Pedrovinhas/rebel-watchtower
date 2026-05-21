import { http } from '@/shared/lib/http';
import type { RankingEntry } from '../model/types';

export async function getRanking(): Promise<RankingEntry[]> {
  return http<RankingEntry[]>('/api/entities/ranking');
}
