import Link from "next/link";
import type { Announcement } from "@/lib/types/content";
import { formatDateShortTr } from "@/lib/utils/date";

export function HomeUpdates({
  announcements,
}: {
  announcements: Announcement[];
}) {
  if (announcements.length === 0) return null;

  return (
    <section className="py-16 sm:py-20">
      <div className="grid gap-8 border-t border-white/25 pt-3 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <h2 className="text-xl font-semibold tracking-[-0.01em] text-white">Blog</h2>
          <p className="mt-3 max-w-[16rem] text-[15px] leading-relaxed text-white/55">
            Platformdan ve programlardan güncellemeler.
          </p>
          <Link
            href="/duyurular"
            className="mt-4 inline-block text-[15px] text-white/70 underline decoration-white/25 underline-offset-4 transition hover:text-white hover:decoration-white"
          >
            Tüm yazılar →
          </Link>
        </div>

        <ul className="divide-y divide-white/10 lg:col-span-8">
          {announcements.map((a) => (
            <li key={a.id}>
              <Link
                href={`/duyurular/${a.slug}`}
                className="group grid gap-1 py-5 sm:grid-cols-[8.5rem_1fr] sm:gap-x-6 sm:first:pt-1"
              >
                <time
                  dateTime={a.publishedAt}
                  className="text-sm tabular-nums text-white/45 sm:pt-2"
                >
                  {formatDateShortTr(a.publishedAt)}
                </time>
                <span className="text-pretty text-lg font-medium leading-snug text-white/85 underline decoration-white/0 underline-offset-4 transition group-hover:text-white group-hover:decoration-white/40">
                  {a.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
