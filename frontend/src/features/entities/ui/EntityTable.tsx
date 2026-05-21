'use client';

import clsx from 'clsx';
import type { Entity } from '../model/types';
import { useConfig } from '@/shared/hooks/useConfig';

interface Props {
  entities: Entity[];
}

export function EntityTable({ entities }: Props) {
  const { suspensionThreshold } = useConfig();
  const warningThreshold = Math.floor(suspensionThreshold * 0.8);

  function rowClass(entity: Entity): string {
    if (entity.status === 'suspended') return 'row-suspended';
    if (entity.critical_events_count >= warningThreshold) return 'row-warning';
    return 'row-active';
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-outline-variant text-on-surface-variant uppercase text-xs tracking-wider">
            <th className="py-3 px-4 text-left font-medium">Entity</th>
            <th className="py-3 px-4 text-left font-medium">Status</th>
            <th className="py-3 px-4 text-right font-medium">Total Events</th>
            <th className="py-3 px-4 text-right font-medium">Critical</th>
            <th className="py-3 px-4 text-right font-medium">Last Event</th>
          </tr>
        </thead>
        <tbody>
          {entities.map((entity) => (
            <tr
              key={entity.id}
              className={clsx(
                'border-b border-outline-variant hover:bg-surface-container transition-colors',
                rowClass(entity),
              )}
            >
              <td className="py-3 px-4 font-medium text-on-surface">
                {entity.name}
              </td>
              <td className="py-3 px-4">
                <EntityStatusBadge status={entity.status} />
              </td>
              <td className="py-3 px-4 text-right text-on-surface-variant tabular-nums">
                {entity.total_events_count}
              </td>
              <td className="py-3 px-4 text-right tabular-nums">
                <span
                  className={clsx(
                    entity.critical_events_count > 0
                      ? 'text-error font-semibold'
                      : 'text-on-surface-variant',
                  )}
                >
                  {entity.critical_events_count}
                  {entity.critical_events_count >= warningThreshold &&
                    entity.status === 'active' && (
                      <span className="ml-1 text-xs text-yellow-400">⚠</span>
                    )}
                </span>
              </td>
              <td className="py-3 px-4 text-right text-on-surface-variant text-xs">
                {entity.last_event_at
                  ? new Date(entity.last_event_at).toLocaleString()
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EntityStatusBadge({ status }: { status: 'active' | 'suspended' }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium uppercase tracking-wide',
        status === 'active'
          ? 'text-primary border border-primary'
          : 'text-error border border-error bg-error-container/20',
      )}
    >
      <span
        className={clsx(
          'w-1.5 h-1.5 rounded-full',
          status === 'active' ? 'bg-primary' : 'bg-error',
        )}
      />
      {status}
    </span>
  );
}
