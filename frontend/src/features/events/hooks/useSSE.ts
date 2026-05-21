'use client';

import { useState, useEffect, useRef } from 'react';
import type { Event } from '../model/types';

const MAX_EVENTS = 50;
const INITIAL_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 30_000;

interface UseSSEResult {
  events: Event[];
  connected: boolean;
}

export function useSSE(url: string): UseSSEResult {
  const [events, setEvents] = useState<Event[]>([]);
  const [connected, setConnected] = useState(false);
  const backoffRef = useRef(INITIAL_BACKOFF_MS);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let unmounted = false;

    const connect = () => {
      if (unmounted) return;

      const es = new EventSource(url);
      esRef.current = es;

      es.onopen = () => {
        if (unmounted) return;
        setConnected(true);
        backoffRef.current = INITIAL_BACKOFF_MS;
      };

      es.onmessage = (e: MessageEvent<string>) => {
        if (unmounted) return;
        try {
          const event = JSON.parse(e.data) as Event;
          setEvents((prev) => {
            if (prev.some((existing) => existing.id === event.id)) return prev;
            return [event, ...prev].slice(0, MAX_EVENTS);
          });
        } catch {
          //
        }
      };

      es.onerror = () => {
        if (unmounted) return;
        setConnected(false);
        es.close();

        const delay = backoffRef.current;
        backoffRef.current = Math.min(delay * 2, MAX_BACKOFF_MS);

        timeoutRef.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      unmounted = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (esRef.current) esRef.current.close();
    };
  }, [url]);

  return { events, connected };
}
