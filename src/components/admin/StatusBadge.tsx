import type { ReviewStatus } from "@/lib/types/foundOpportunity";

const labelTr: Record<ReviewStatus, string> = {
  pending: "Beklemede",
  approved: "Onaylandı",
  rejected: "Reddedildi"
};

const styles: Record<ReviewStatus, string> = {
  pending: "border-amber-300 bg-amber-50 text-amber-900",
  approved: "border-emerald-300 bg-emerald-50 text-emerald-900",
  rejected: "border-red-300 bg-red-50 text-red-900"
};

type Props = {
  status: ReviewStatus;
  className?: string;
};

export function StatusBadge({ status, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status]} ${className}`}
    >
      {labelTr[status]}
    </span>
  );
}
