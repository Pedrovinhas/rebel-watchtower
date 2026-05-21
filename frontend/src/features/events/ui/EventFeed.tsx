'use client';

import clsx from 'clsx';
import { useSSE } from '../hooks/useSSE';
import type { Event } from '../model/types';

const TYPE_STYLES: Record<Event['type'], string> = {
  info: 'border border-blue-500 text-blue-400',
  warning: 'border border-yellow-500 text-yellow-400',
  critical: 'border border-error text-error',
};

const SSE_URL = `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/events/stream`;

export function EventFeed() {
  const { events, connected } = useSSE(SSE_URL);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-bold text-on-surface uppercase tracking-widest">
          Live Event Feed
        </h2>
        <span
          className={clsx(
            'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs uppercase border',
            connected
              ? 'border-primary text-primary'
              : 'border-on-surface-variant text-on-surface-variant',
          )}
        >
          <span
            className={clsx(
              'w-1.5 h-1.5 rounded-full',
              connected ? 'bg-primary animate-pulse' : 'bg-on-surface-variant',
            )}
          />
          {connected ? 'Live' : 'Reconnecting…'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {events.length === 0 && (
          <p className="text-sm text-on-surface-variant py-8 text-center">
            Waiting for events…
          </p>
        )}
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
      <span
        className={clsx(
          'flex-shrink-0 text-xs px-1.5 py-0.5 uppercase font-semibold',
          TYPE_STYLES[event.type],
        )}
      >
        {event.type}
      </span>
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
