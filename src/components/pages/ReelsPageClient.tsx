"use client";

import { useMemo, useState } from "react";
import type { Reel } from "@/lib/types/content";
import { ReelGrid } from "@/components/reels/ReelGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getReelTags } from "@/lib/repositories/reelRepository";

export function ReelsPageClient({ reels }: { reels: Reel[] }) {
  const tags = useMemo(() => ["Tümü", ...getReelTags()], []);
  const [tag, setTag] = useState("Tümü");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const filtered = useMemo(() => {
    return reels.filter((r) => {
      if (featuredOnly && !r.featured) return false;
      if (tag !== "Tümü" && r.tag !== tag) return false;
      return true;
    });
  }, [reels, tag, featuredOnly]);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="İçerik"
        title="Hızlı özetler, başvuru ipuçları ve içerikler"
        description="Instagram içeriklerimizi burada kartlar halinde gör; kategoriye göre filtrele."
        tone="light"
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="text-xs font-semibold text-slate-700">Etiket</label>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-brand-200 sm:w-64"
            >
              {tags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

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
              <span className="font-semibold text-ink">{filtered.length}</span> içerik
            </div>
          </div>
        </div>
      </div>

      <ReelGrid reels={filtered} />
    </div>
  );
}

