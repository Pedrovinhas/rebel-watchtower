'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useState } from 'react';
import { CreateEntityModal } from '@/features/entities/ui/CreateEntityModal';
import { RegisterEventModal } from '@/features/events/ui/RegisterEventModal';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/events/stream', label: 'Live Feed', icon: 'stream' },
  { href: '/ranking', label: 'Ranking', icon: 'leaderboard' },
];

export function SideNav() {
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <aside className="w-60 min-h-screen flex flex-col bg-surface-container-low border-r border-outline-variant shrink-0">
        <div className="px-5 py-6 border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <span className="text-primary font-black text-xl tracking-widest uppercase">
              Holocron
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5 uppercase tracking-widest">
            Sentinel
          </p>
        </div>

        <div className="px-4 py-4 border-b border-outline-variant flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="w-full bg-primary text-on-primary text-sm font-bold uppercase tracking-widest py-2.5 hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">add</span>
            New Entity
          </button>
          <button
            type="button"
            onClick={() => setShowEventModal(true)}
            className="w-full border border-outline-variant text-on-surface text-sm font-bold uppercase tracking-widest py-2.5 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">bolt</span>
            Register Event
          </button>
        </div>

        <nav className="flex-1 py-4">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ href, label, icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={clsx(
                      'flex items-center gap-3 px-5 py-2.5 text-sm transition-colors',
                      active
                        ? 'text-primary bg-primary/10 border-l-2 border-primary font-medium'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container border-l-2 border-transparent',
                    )}
                  >
                    <span className="material-symbols-outlined text-xl leading-none">
                      {icon}
                    </span>
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-5 py-4 border-t border-outline-variant">
          <p className="text-xs text-on-surface-variant uppercase tracking-wider">
            Alliance Sentinel v1.0
          </p>
        </div>
      </aside>

      {showModal && (
        <CreateEntityModal
          onCreated={() => {
            setShowModal(false);
            setRefreshKey((k) => k + 1);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
      {showEventModal && (
        <RegisterEventModal onClose={() => setShowEventModal(false)} />
      )}
      <span data-refresh-key={refreshKey} className="hidden" />
    </>
  );
}
