'use client';

import { useRanking } from '../hooks/useRanking';

export function RankingList() {
  const { data, loading, error } = useRanking();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-on-surface-variant py-8 justify-center">
        <span className="text-sm">Loading ranking…</span>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-error border border-error/40 bg-error-container/20 px-3 py-2">
        {error}
      </p>
    );
  }

  if (data.length === 0) {
    return (
      <p className="text-sm text-on-surface-variant py-8 text-center">
        No critical events recorded in the last 7 days.
      </p>
    );
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
