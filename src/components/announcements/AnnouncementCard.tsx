import Image from "next/image";
import type { Announcement } from "@/lib/types/content";
import { Badge } from "@/components/ui/Badge";
import { formatDateTr } from "@/lib/utils/date";

export function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const preview = announcement.content.slice(0, 160).trimEnd();
  const hasMore = announcement.content.length > 160;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition hover:shadow-card">
      {announcement.coverImage ? (
        <div className="relative h-48 w-full bg-slate-100">
          <Image
            alt={announcement.title}
            src={announcement.coverImage}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.02]"
          />
          {announcement.featured ? (
            <div className="absolute left-3 top-3">
              <Badge tone="brand">Öne çıkan</Badge>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-3 p-5">
        {!announcement.coverImage && announcement.featured ? (
          <Badge tone="brand">Öne çıkan</Badge>
        ) : null}
        <div>
          <h3 className="text-balance text-lg font-semibold text-ink">
            {announcement.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {preview}{hasMore ? "…" : ""}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">{formatDateTr(announcement.publishedAt)}</div>
          {announcement.link ? (
            <a
              href={announcement.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              Devamını Oku →
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
