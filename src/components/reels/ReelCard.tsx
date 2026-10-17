import Image from "next/image";
import type { Reel } from "@/lib/types/content";
import { Badge } from "@/components/ui/Badge";
import { formatDateTr } from "@/lib/utils/date";

export function ReelCard({ reel }: { reel: Reel }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition hover:shadow-card">
      <div className="relative h-40 w-full bg-slate-100">
        {reel.thumbnail ? (
          <Image
            alt={reel.title}
            src={reel.thumbnail}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        ) : null}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {reel.featured ? <Badge tone="brand">Öne çıkan</Badge> : null}
          <Badge>{reel.tag}</Badge>
        </div>
      </div>

      <div className="space-y-3 p-5">
        <div>
          <h3 className="text-balance text-lg font-semibold text-ink">{reel.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
            {reel.shortDescription}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-slate-600">{formatDateTr(reel.publishedAt)}</div>
          <a
            href={reel.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            Instagram →
          </a>
        </div>
      </div>
    </article>
  );
}

