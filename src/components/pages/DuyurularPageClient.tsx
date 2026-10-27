"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Announcement } from "@/lib/types/content";
import { PageIntro, fieldClass, labelClass } from "@/components/ui/PageIntro";
import { formatDateShortTr } from "@/lib/utils/date";

function excerpt(content: string) {
  const first = content.split("\n").find((l) => l.trim()) ?? "";
  return first.trim();
}

export function DuyurularPageClient({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr-TR");
    return announcements
      .filter(
        (a) =>
          !q ||
          a.title.toLocaleLowerCase("tr-TR").includes(q) ||
          a.content.toLocaleLowerCase("tr-TR").includes(q)
      )
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
  }, [announcements, search]);

  return (
    <div className="pb-24">
      <PageIntro
        title="Blog"
        description="Platformdan ve programlardan güncellemeler."
      />

      <div className="border-y border-white/10 py-5 sm:max-w-sm sm:border-y-0 sm:py-0">
        <label htmlFor="blog-q" className={labelClass}>
          Ara
        </label>
        <input
          id="blog-q"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Yazılarda ara"
          className={fieldClass}
        />
      </div>

      <ul className="mt-10 border-t border-white/20">
        {filtered.map((a) => (
          <li key={a.id} className="border-b border-white/10">
            <Link
              href={`/duyurular/${a.slug}`}
              className="group grid gap-2 py-7 md:grid-cols-[9rem_1fr] md:gap-x-8"
            >
              <time
                dateTime={a.publishedAt}
                className="text-sm tabular-nums text-white/45 md:pt-1.5"
              >
                {formatDateShortTr(a.publishedAt)}
              </time>
              <div>
                <h2 className="text-pretty text-2xl font-semibold leading-snug tracking-[-0.015em] text-white underline decoration-white/0 underline-offset-4 transition group-hover:decoration-white/40">
                  {a.title}
                </h2>
                <p className="mt-2 line-clamp-2 max-w-2xl text-base leading-relaxed text-white/55">
                  {excerpt(a.content)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="mt-10 text-lg text-white/65">Aramana uyan yazı yok.</p>
      )}
    </div>
  );
}
