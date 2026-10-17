"use client";

import { useMemo, useState } from "react";
import type { Announcement } from "@/lib/types/content";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function DuyurularPageClient({ announcements }: { announcements: Announcement[] }) {
  const [search, setSearch] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return announcements.filter((a) => {
      if (featuredOnly && !a.featured) return false;
      if (q && !a.title.toLowerCase().includes(q) && !a.content.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [announcements, search, featuredOnly]);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Blog"
        title="Haberler ve güncel yazılar"
        description="B-Global Network'ten en güncel haberler, yazılar ve içerikler."
        tone="light"
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Blogda ara…"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-brand-200 sm:max-w-xs"
          />
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={featuredOnly}
                onChange={(e) => setFeaturedOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
              />
              Sadece öne çıkanlar
            </label>
            <div className="text-sm text-slate-600">
              <span className="font-semibold text-ink">{filtered.length}</span> duyuru
            </div>
          </div>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
          Filtrelere uygun duyuru yok.
        </p>
      )}
    </div>
  );
}
