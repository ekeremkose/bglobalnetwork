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

