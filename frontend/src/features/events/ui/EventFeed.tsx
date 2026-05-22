'use client';

import { useSSE } from '../hooks/useSSE';
import type { Event } from '../model/types';
import { Badge } from '@/shared/ui/Badge';
import { EmptyState } from '@/shared/ui/EmptyState';

const SSE_URL = `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/events/stream`;

export function EventFeed() {
  const { events, connected } = useSSE(SSE_URL);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-bold text-on-surface uppercase tracking-widest">
          Live Event Feed
        </h2>
        <Badge variant={connected ? 'active' : 'default'} dot pulse={connected}>
          {connected ? 'Live' : 'Reconnecting…'}
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {events.length === 0 && <EmptyState message="Waiting for events…" />}
        {events.map((event) => (
          <EventCard key={`${event.id}-${event.created_at}`} event={event} />
        ))}
      </div>
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  return (
    <div className="bg-surface-container border border-outline-variant p-3 flex items-start gap-3">
      <Badge variant={event.type} className="flex-shrink-0 px-1.5 py-0.5 font-semibold">
        {event.type}
      </Badge>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-on-surface-variant">
          {event.entity_name
            ? <span className="text-on-surface font-medium">{event.entity_name}</span>
            : <span>Entity&nbsp;{event.entity_id}</span>
          }
          {' '}&mdash;{' '}
          <code className="text-on-surface/70">{event.external_id}</code>
        </p>
        <pre className="mt-1 text-xs text-on-surface-variant overflow-x-auto whitespace-pre-wrap break-all">
          {JSON.stringify(event.payload, null, 2)}
        </pre>
      </div>
      <time className="flex-shrink-0 text-xs text-on-surface-variant tabular-nums">
        {new Date(event.created_at).toLocaleTimeString()}
      </time>
    </div>
  );
}
