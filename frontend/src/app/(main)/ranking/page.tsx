import { RankingList } from '@/features/ranking/ui/RankingList';

export default function RankingPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-on-surface uppercase tracking-widest">
          Criticality Ranking
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Entities ranked by critical events in the last 7 days &mdash; refreshes every 60 s
        </p>
      </div>
      <div className="max-w-xl">
        <RankingList />
      </div>
    </div>
  );
}
