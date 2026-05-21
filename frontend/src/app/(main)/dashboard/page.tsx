'use client';

import { useState } from 'react';
import { useEntities } from '@/features/entities/hooks/useEntities';
import { EntityTable } from '@/features/entities/ui/EntityTable';
import { CreateEntityModal } from '@/features/entities/ui/CreateEntityModal';
import { RegisterEventModal } from '@/features/events/ui/RegisterEventModal';

export default function DashboardPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'active' | 'suspended' | ''>('');
  const [search, setSearch] = useState('');
  const { data, loading, error, refresh } = useEntities(page, 20, {
    status: statusFilter || undefined,
    search: search || undefined,
  });
  const [showModal, setShowModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  return (
    <div className="p-8">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-on-surface uppercase tracking-widest">
            Entity Dashboard
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            All monitored entities
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowEventModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant text-on-surface text-sm font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-base">bolt</span>
            Register Event
          </button>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary text-sm font-bold uppercase tracking-widest hover:bg-yellow-400 transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span>
            New Entity
          </button>
        </div>
      </div>

      {data && (
        <div className="flex gap-4 mb-6">
          <KpiCard
            label="Total Entities"
            value={String(data.meta.total)}
          />
          <KpiCard
            label="Active"
            value={String(data.data.filter((e) => e.status === 'active').length)}
            accent="primary"
          />
          <KpiCard
            label="Suspended"
            value={String(data.data.filter((e) => e.status === 'suspended').length)}
            accent="error"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name…"
          className="bg-surface-container border border-outline-variant px-3 py-1.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary w-56"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as '' | 'active' | 'suspended'); setPage(1); }}
          className="bg-surface-container border border-outline-variant px-3 py-1.5 text-sm text-on-surface focus:outline-none focus:border-primary cursor-pointer"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        {(search || statusFilter) && (
          <button
            type="button"
            onClick={() => { setSearch(''); setStatusFilter(''); setPage(1); }}
            className="text-xs text-on-surface-variant hover:text-primary transition-colors underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="bg-surface-container-high border border-outline-variant">
        {loading && (
          <div className="flex items-center justify-center py-16 text-on-surface-variant text-sm">
            Loading entities…
          </div>
        )}
        {error && (
          <div className="px-4 py-3 text-sm text-error border-b border-error/40">
            {error}
          </div>
        )}
        {!loading && data && data.data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">
              inbox
            </span>
            <p className="text-on-surface-variant text-sm">No entities registered yet.</p>
          </div>
        )}
        {!loading && data && data.data.length > 0 && (
          <EntityTable entities={data.data} />
        )}
      </div>

      {data && data.meta.pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-on-surface-variant">
          <span>
            Page {data.meta.page} of {data.meta.pages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border border-outline-variant hover:border-primary hover:text-primary disabled:opacity-40 transition-colors"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= data.meta.pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border border-outline-variant hover:border-primary hover:text-primary disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <CreateEntityModal
          onCreated={() => {
            setShowModal(false);
            refresh();
          }}
          onClose={() => setShowModal(false)}
        />
      )}

      {showEventModal && (
        <RegisterEventModal onClose={() => setShowEventModal(false)} />
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'primary' | 'error';
}) {
  return (
    <div className="bg-surface-container-high border border-outline-variant px-5 py-4 min-w-36">
      <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">
        {label}
      </p>
      <p
        className={`text-2xl font-black tabular-nums ${
          accent === 'primary'
            ? 'text-primary'
            : accent === 'error'
            ? 'text-error'
            : 'text-on-surface'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
