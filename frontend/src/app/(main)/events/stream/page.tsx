import { EventFeed } from '@/features/events/ui/EventFeed';

export default function EventStreamPage() {
  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-on-surface uppercase tracking-widest">
          Live Feed
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Real-time event stream via SSE
        </p>
      </div>
      <div className="flex-1">
        <EventFeed />
      </div>
    </div>
  );
}
