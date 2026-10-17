type Props = {
  pending: number;
  approved: number;
  rejected: number;
};

export function ReviewSummaryStats({ pending, approved, rejected }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-amber-900">
          Beklemede
        </div>
        <div className="mt-2 text-3xl font-bold tabular-nums text-amber-950">{pending}</div>
      </div>
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-emerald-900">
          Onaylandı
        </div>
        <div className="mt-2 text-3xl font-bold tabular-nums text-emerald-950">{approved}</div>
      </div>
      <div className="rounded-2xl border border-red-200 bg-red-50/80 p-5 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-red-900">
          Reddedildi
        </div>
        <div className="mt-2 text-3xl font-bold tabular-nums text-red-950">{rejected}</div>
      </div>
    </div>
  );
}
