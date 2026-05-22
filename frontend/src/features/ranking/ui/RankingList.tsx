'use client';

import { useRanking } from '../hooks/useRanking';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { EmptyState } from '@/shared/ui/EmptyState';

export function RankingList() {
  const { data, loading, error } = useRanking();

  if (loading) return <Spinner label="Loading ranking…" />;

  if (error) return <ErrorMessage message={error} />;

  if (data.length === 0) {
    return <EmptyState message="No critical events recorded in the last 7 days." />;
  }

  return (
    <ol className="space-y-2">
      {data.map((entry, i) => (
        <li
          key={entry.entity_id}
          className="flex items-center gap-4 bg-surface-container border border-outline-variant px-4 py-3"
        >
          <span className="w-6 text-sm font-bold text-primary tabular-nums text-center">
            {i + 1}
          </span>
          <span className="flex-1 text-sm font-medium text-on-surface truncate">
            {entry.entity_name}
          </span>
          <span className="text-sm font-bold text-error tabular-nums">
            {entry.critical_count}
          </span>
          <span className="text-xs text-on-surface-variant">critical</span>
        </li>
      ))}
    </ol>
  );
}
