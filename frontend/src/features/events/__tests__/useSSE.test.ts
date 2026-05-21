import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSSE } from '../hooks/useSSE';

type EventMap = {
  open?: () => void;
  message?: (e: { data: string }) => void;
  error?: () => void;
};

class MockEventSource {
  static instance: MockEventSource | null = null;

  readonly url: string;
  onopen: EventMap['open'] | null = null;
  onmessage: EventMap['message'] | null = null;
  onerror: EventMap['error'] | null = null;
  closed = false;

  constructor(url: string) {
    this.url = url;
    MockEventSource.instance = this;
  }

  close() {
    this.closed = true;
  }

  triggerOpen() {
    this.onopen?.();
  }

  triggerMessage(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }

  triggerError() {
    this.onerror?.();
  }
}

const globalWithES = global as typeof global & { EventSource: unknown };

describe('useSSE', () => {
  beforeEach(() => {
    MockEventSource.instance = null;
    globalWithES.EventSource = MockEventSource;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllTimers();
  });

  it('starts disconnected and becomes connected on open', () => {
    const { result } = renderHook(() => useSSE('/api/events/stream'));
    expect(result.current.connected).toBe(false);

    act(() => {
      MockEventSource.instance?.triggerOpen();
    });

    expect(result.current.connected).toBe(true);
  });

  it('adds received events to the list', () => {
    const { result } = renderHook(() => useSSE('/api/events/stream'));

    act(() => {
      MockEventSource.instance?.triggerOpen();
      MockEventSource.instance?.triggerMessage({
        id: 1,
        entity_id: 1,
        external_id: 'ext-1',
        type: 'info',
        payload: {},
        created_at: new Date().toISOString(),
      });
    });

    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].external_id).toBe('ext-1');
  });

  it('prepends new events (latest first)', () => {
    const { result } = renderHook(() => useSSE('/api/events/stream'));

    act(() => {
      MockEventSource.instance?.triggerOpen();
      MockEventSource.instance?.triggerMessage({ id: 1, external_id: 'first', entity_id: 1, type: 'info', payload: {}, created_at: new Date().toISOString() });
      MockEventSource.instance?.triggerMessage({ id: 2, external_id: 'second', entity_id: 1, type: 'info', payload: {}, created_at: new Date().toISOString() });
    });

    expect(result.current.events[0].external_id).toBe('second');
    expect(result.current.events[1].external_id).toBe('first');
  });

  it('reconnects with exponential backoff on error', () => {
    const { result } = renderHook(() => useSSE('/api/events/stream'));
    const firstInstance = MockEventSource.instance;

    act(() => {
      MockEventSource.instance?.triggerError();
    });

    expect(result.current.connected).toBe(false);
    expect(MockEventSource.instance).toBe(firstInstance); 

    // Advance 1s (initial backoff)
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(MockEventSource.instance).not.toBe(firstInstance);
  });

  it('closes EventSource on unmount', () => {
    const { unmount } = renderHook(() => useSSE('/api/events/stream'));
    const instance = MockEventSource.instance;

    unmount();

    expect(instance?.closed).toBe(true);
  });
});
