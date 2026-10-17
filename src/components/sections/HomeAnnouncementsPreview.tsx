import Link from "next/link";
import type { Announcement } from "@/lib/types/content";
import { formatDateTr } from "@/lib/utils/date";

export function HomeAnnouncementsPreview({
  announcements,
}: {
  announcements: Announcement[];
}) {
  return (
    <section className="py-14 sm:py-16">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-bold text-white sm:text-xl">Blog</h2>
        <Link
          href="/duyurular"
          className="group shrink-0 text-sm text-white/40 transition hover:text-white"
        >
          Tüm blog yazılarını gör{" "}
          <span className="inline-block transition-transform duration-150 group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </div>

      <div className="mt-5">
        {announcements.map((ann) => {
          const El = ann.link ? "a" : Link;
          const props = ann.link
            ? { href: ann.link, target: "_blank", rel: "noreferrer" }
            : { href: "/duyurular" };

          return (
            <El
              key={ann.id}
              {...(props as never)}
              className="group flex items-baseline justify-between gap-6 border-t border-white/[0.06] py-3.5 transition"
            >
              <h3 className="min-w-0 flex-1 truncate text-sm font-medium text-white/80 transition group-hover:text-white">
                {ann.title}
              </h3>
              <span className="shrink-0 text-xs text-white/25">
                {formatDateTr(ann.publishedAt)}
              </span>
            </El>
          );
        })}
        <div className="border-t border-white/[0.06]" />
      </div>
    </section>
  );
}
