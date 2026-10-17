"use client";

import { useEffect, useMemo, useState } from "react";
import type { Category, Country, Opportunity } from "@/lib/types/content";
import { OpportunityGrid } from "@/components/opportunities/OpportunityGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getDeadlineStatus } from "@/lib/utils/date";
import { useSearchParams } from "next/navigation";

type Props = {
  opportunities: Opportunity[];
  categories: Category[];
  countries: Country[];
};

export function OpportunitiesPageClient({ opportunities, categories, countries }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [deadlineStatus, setDeadlineStatus] = useState<string>("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;
    const featured = searchParams.get("featured");
    const cat = searchParams.get("category");
    const ctry = searchParams.get("country");
    if (featured === "1") setFeaturedOnly(true);
    if (cat) setCategory(cat);
    if (ctry) setCountry(ctry);
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return opportunities.filter((o) => {
      if (featuredOnly && !o.featured) return false;
      if (category && o.category !== category) return false;
      if (country && o.country !== country) return false;
      if (deadlineStatus) {
        const s = getDeadlineStatus(o.deadline);
        if (s !== deadlineStatus) return false;
      }
      if (!q) return true;
      const hay = `${o.title} ${o.shortDescription}`.toLowerCase();
      return hay.includes(q);
    });
  }, [opportunities, query, category, country, deadlineStatus, featuredOnly]);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Projeler"
        title="Projeleri filtrele ve keşfet"
        description="Arama yap, kategori/ülke seç ve son tarihe göre hızlıca daralt."
        tone="light"
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
        <div className="grid gap-3 md:grid-cols-12">
          <div className="md:col-span-5">
            <label className="text-xs font-semibold text-slate-700">Arama</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Örn: Erasmus, staj, burs, yaz okulu..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-brand-200"
            />
          </div>

          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-slate-700">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-brand-200"
            >
              <option value="">Tümü</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-700">Ülke</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-brand-200"
            >
              <option value="">Tümü</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-700">Son tarih</label>
            <select
              value={deadlineStatus}
              onChange={(e) => setDeadlineStatus(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-brand-200"
            >
              <option value="">Tümü</option>
              <option value="active">Açık</option>
              <option value="soon">Son günler</option>
              <option value="closed">Süre doldu</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
            <span className="font-semibold text-ink">{filtered.length}</span> sonuç
          </div>
        </div>
      </div>

      <OpportunityGrid opportunities={filtered} />
    </div>
  );
}

