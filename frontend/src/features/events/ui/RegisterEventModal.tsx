'use client';

import { EventForm } from './EventForm';

interface Props {
  onClose: () => void;
}

export function RegisterEventModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 overflow-y-auto py-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Register event"
    >
      <div className="relative w-full max-w-xl mx-4">
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-8 right-0 text-on-surface-variant hover:text-on-surface transition-colors text-sm uppercase tracking-wider"
          aria-label="Close modal"
        >
          ✕ Close
        </button>
        <EventForm onSuccess={onClose} />
      </div>
    </div>
  );
}
