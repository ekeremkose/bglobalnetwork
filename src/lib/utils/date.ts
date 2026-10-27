export function formatDateTr(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(d);
}

export function getDeadlineStatus(iso: string, now = new Date()) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "active" as const;

  const ms = d.getTime() - now.getTime();
  const days = ms / (1000 * 60 * 60 * 24);
  if (days < 0) return "closed" as const;
  if (days <= 10) return "soon" as const;
  return "active" as const;
}


export function daysUntil(iso: string, now = new Date()) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 0;
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDayMonth(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const month = new Intl.DateTimeFormat("tr-TR", {
    month: "short",
    timeZone: "UTC",
  })
    .format(d)
    .replace(".", "");
  return `${d.getUTCDate()} ${month}`;
}

export function formatDateShortTr(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

/** "20 gün kaldı", "Süresi doldu" — shared wording for every deadline on the site. */
export function deadlineLabel(iso: string, now = new Date()) {
  const status = getDeadlineStatus(iso, now);
  if (status === "closed") return "Süresi doldu";
  return `${daysUntil(iso, now)} gün kaldı`;
}

export type StatusFilter = "" | "active" | "soon" | "closed";

/**
 * "active" means every programme that has not closed (including the ones whose
 * deadline is near); "soon" is the narrower subset of those.
 */
export function matchesStatusFilter(
  iso: string,
  filter: StatusFilter,
  now = new Date()
) {
  if (!filter) return true;
  const status = getDeadlineStatus(iso, now);
  if (filter === "active") return status !== "closed";
  return status === filter;
}
