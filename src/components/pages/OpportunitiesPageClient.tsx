"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { Category, Country, Opportunity } from "@/lib/types/content";
import {
  OpportunityRow,
  OpportunityTableHead,
} from "@/components/opportunities/OpportunityRow";
import {
  PageIntro,
  fieldClass,
  labelClass,
} from "@/components/ui/PageIntro";
import {
  getDeadlineStatus,
  matchesStatusFilter,
  type StatusFilter,
} from "@/lib/utils/date";

type Props = {
  opportunities: Opportunity[];
  categories: Category[];
  countries: Country[];
};

type Param = "q" | "category" | "country" | "durum";

const STATUS_OPTIONS: { value: Exclude<StatusFilter, "">; label: string }[] = [
  { value: "active", label: "Açık" },
  { value: "soon", label: "Son günler" },
  { value: "closed", label: "Süresi doldu" },
];

const time = (iso: string) => new Date(iso).getTime();

export function OpportunitiesPageClient({
  opportunities,
  categories,
  countries,
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams() ?? new URLSearchParams();

  // The URL is the single source of truth for the three selects; only values
  // that exist in the data are accepted, so a stale or hand-typed parameter
  // never leaves a select showing something other than what is applied.
  const rawCategory = searchParams.get("category") ?? "";
  const rawCountry = searchParams.get("country") ?? "";
  const rawStatus = searchParams.get("durum") ?? "";
  const category = categories.some((c) => c.slug === rawCategory)
    ? rawCategory
    : "";
  const country = countries.some((c) => c.code === rawCountry)
    ? rawCountry
    : "";
  const status: StatusFilter = STATUS_OPTIONS.some((o) => o.value === rawStatus)
    ? (rawStatus as StatusFilter)
    : "";

  // The search box keeps its own state so typing is never interrupted; it is
  // written to the URL after a pause and re-read when the URL changes from
  // outside (back/forward, a navbar link).
  const urlQuery = searchParams.get("q") ?? "";
  const searchKey = searchParams.toString();
  const [query, setQuery] = useState(urlQuery);
  const pendingWrite = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The query string this component last wrote itself, so a URL change that
  // was not ours (Back/Forward, a navbar link) can be told apart from our own.
  const lastWritten = useRef<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const cancelPendingWrite = () => {
    if (pendingWrite.current) clearTimeout(pendingWrite.current);
    pendingWrite.current = null;
  };

  useEffect(() => {
    if (lastWritten.current === searchKey) {
      lastWritten.current = null;
      return;
    }
    // Navigation from outside: it wins over a search still waiting to be
    // written, which would otherwise overwrite the new URL.
    cancelPendingWrite();
    lastWritten.current = null;
    setQuery(urlQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKey]);

  useEffect(() => {
    window.addEventListener("popstate", cancelPendingWrite);
    return () => {
      window.removeEventListener("popstate", cancelPendingWrite);
      cancelPendingWrite();
    };
  }, []);

  const writeUrl = (patch: Partial<Record<Param, string>>, push: boolean) => {
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(patch)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const qs = params.toString();
    if (qs === window.location.search.slice(1)) return;
    lastWritten.current = qs;
    const url = qs ? `${pathname}?${qs}` : pathname;
    if (push) window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  };

  const onQueryChange = (value: string) => {
    setQuery(value);
    cancelPendingWrite();
    const base = window.location.search;
    pendingWrite.current = setTimeout(() => {
      pendingWrite.current = null;
      // The URL moved on while we waited: drop the write.
      if (window.location.search !== base) return;
      writeUrl({ q: value.trim() }, false);
    }, 350);
  };

  const onSelect = (key: Exclude<Param, "q">, value: string) => {
    // Flush a half-written search first so the new history entry includes it.
    cancelPendingWrite();
    writeUrl({ q: query.trim(), [key]: value }, true);
  };

  const clear = () => {
    cancelPendingWrite();
    setQuery("");
    writeUrl({ q: "", category: "", country: "", durum: "" }, true);
  };

  const { open, closed } = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    const matches = opportunities.filter((o) => {
      if (category && o.category !== category) return false;
      if (country && o.country !== country) return false;
      if (!matchesStatusFilter(o.deadline, status)) return false;
      if (!q) return true;
      return `${o.title} ${o.shortDescription}`
        .toLocaleLowerCase("tr-TR")
        .includes(q);
    });
    return {
      open: matches
        .filter((o) => getDeadlineStatus(o.deadline) !== "closed")
        .sort((a, b) => time(a.deadline) - time(b.deadline)),
      closed: matches
        .filter((o) => getDeadlineStatus(o.deadline) === "closed")
        .sort((a, b) => time(b.deadline) - time(a.deadline)),
    };
  }, [opportunities, query, category, country, status]);

  const totalOpen = opportunities.filter(
    (o) => getDeadlineStatus(o.deadline) !== "closed"
  ).length;
  const totalClosed = opportunities.length - totalOpen;
  const filtering = !!(query.trim() || category || country || status);

  const chips = [
    category && {
      key: "category" as const,
      label: categories.find((c) => c.slug === category)?.title ?? category,
    },
    country && {
      key: "country" as const,
      label: countries.find((c) => c.code === country)?.name ?? country,
    },
    status && {
      key: "durum" as const,
      label: STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status,
    },
  ].filter((c): c is { key: "category" | "country" | "durum"; label: string } =>
    Boolean(c)
  );

  return (
    <div className="pb-24">
      <PageIntro
        title="Projeler"
        description={`${totalOpen} program başvuruya açık. Süresi dolan ${totalClosed} program arşivde duruyor.`}
      />

      <form
        className="flex flex-col gap-3 border-y border-white/10 py-4 md:gap-4 md:py-6 lg:grid lg:grid-cols-[1fr_12rem_9rem_9rem]"
        onSubmit={(e) => e.preventDefault()}
        role="search"
      >
        <div className="flex items-end gap-3">
          <div className="min-w-0 flex-1">
            <label htmlFor="q" className={`${labelClass} sr-only lg:not-sr-only lg:mb-1.5`}>
              Ara
            </label>
            <input
              id="q"
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Staj, burs, ülke…"
              className={fieldClass}
            />
          </div>
          <button
            type="button"
            onClick={() => setPanelOpen((v) => !v)}
            aria-expanded={panelOpen}
            aria-controls="filtre-paneli"
            className="inline-flex shrink-0 items-center gap-2 rounded-md border border-white/15 px-3.5 py-2.5 text-[15px] text-white transition hover:border-white/30 md:hidden"
          >
            Filtreler
            {chips.length > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-xs font-semibold text-ink">
                {chips.length}
              </span>
            )}
          </button>
        </div>

        {!panelOpen && chips.length > 0 && (
          <ul className="flex flex-wrap gap-2 md:hidden" aria-label="Etkin filtreler">
            {chips.map((c) => (
              <li key={c.key}>
                <button
                  type="button"
                  onClick={() => onSelect(c.key, "")}
                  aria-label={`${c.label} filtresini kaldır`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] py-1 pl-3 pr-2.5 text-sm text-white"
                >
                  {c.label}
                  <span aria-hidden className="text-white/60">
                    ×
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div
          id="filtre-paneli"
          className={`${panelOpen ? "grid" : "hidden"} grid-cols-2 gap-3 md:grid md:grid-cols-3 md:gap-4 lg:contents`}
        >
          <div className="col-span-2 md:col-span-1">
            <label htmlFor="cat" className={labelClass}>
              Kategori
            </label>
            <select
              id="cat"
              value={category}
              onChange={(e) => onSelect("category", e.target.value)}
              className={fieldClass}
            >
              <option value="">Tümü</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ctry" className={labelClass}>
              Ülke
            </label>
            <select
              id="ctry"
              value={country}
              onChange={(e) => onSelect("country", e.target.value)}
              className={fieldClass}
            >
              <option value="">Tümü</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="st" className={labelClass}>
              Durum
            </label>
            <select
              id="st"
              value={status}
              onChange={(e) => onSelect("durum", e.target.value)}
              className={fieldClass}
            >
              <option value="">Tümü</option>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>

      <div className="mt-5 flex items-center justify-between gap-4 text-[15px] text-white/55">
        <span aria-live="polite">
          {open.length + closed.length} program
        </span>
        {filtering && (
          <button
            type="button"
            onClick={clear}
            className="underline decoration-white/30 underline-offset-4 transition hover:text-white"
          >
            Filtreleri temizle
          </button>
        )}
      </div>

      {open.length + closed.length === 0 ? (
        <p className="mt-12 max-w-md text-lg text-white/65">
          Bu filtrelere uyan program yok. Filtreleri gevşetmeyi dene.
        </p>
      ) : (
        <>
          {open.length > 0 && (
            <section className="mt-8" aria-labelledby="acik">
              <h2 id="acik" className="sr-only">
                Başvuruya açık programlar
              </h2>
              <OpportunityTableHead />
              {open.map((o) => (
                <OpportunityRow key={o.id} opportunity={o} />
              ))}
            </section>
          )}

          {closed.length > 0 && (
            <section className="mt-14" aria-labelledby="kapali">
              <h2
                id="kapali"
                className="text-xl font-semibold text-white/80"
              >
                Süresi dolanlar
              </h2>
              <p className="mt-1 mb-4 text-[15px] text-white/45">
                Başvuru kapandı; bir sonraki çağrıyı takip etmek için göz at.
              </p>
              <div className="border-t border-white/10">
                {closed.map((o) => (
                  <OpportunityRow key={o.id} opportunity={o} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
