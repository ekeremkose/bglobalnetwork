import Link from "next/link";
import type { Category, Opportunity } from "@/lib/types/content";
import { OpportunityRow } from "@/components/opportunities/OpportunityRow";

const monthKey = (iso: string) => iso.slice(0, 7);
const monthName = (iso: string) =>
  new Intl.DateTimeFormat("tr-TR", { month: "long", timeZone: "UTC" }).format(
    new Date(iso)
  );

export function HomeCalendar({
  open,
  closedCount,
  categories,
}: {
  open: Opportunity[];
  closedCount: number;
  categories: (Category & { openCount: number })[];
}) {
  const groups: { key: string; name: string; year: string; items: Opportunity[] }[] = [];
  for (const o of open) {
    const key = monthKey(o.deadline);
    let g = groups.find((x) => x.key === key);
    if (!g) {
      g = { key, name: monthName(o.deadline), year: key.slice(0, 4), items: [] };
      groups.push(g);
    }
    g.items.push(o);
  }

  return (
    <section id="acik" className="scroll-mt-24 pb-20 sm:pb-28">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2 border-t border-white/25 pt-3">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
          Başvuru takvimi
        </h2>
        <Link
          href="/opportunities"
          className="text-[15px] text-white/65 underline decoration-white/25 underline-offset-4 transition hover:text-white hover:decoration-white"
        >
          Filtrele ve ara →
        </Link>
      </div>
      <p className="mt-3 text-[15px] text-white/55">
        Başvuruya açık programlar, son tarih sırasıyla.
      </p>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
        <span className="text-white/45">Kategoriye göre</span>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/opportunities?category=${c.slug}`}
            className={`underline decoration-white/0 underline-offset-4 transition hover:text-white hover:decoration-white/60 ${c.openCount > 0 ? "text-white/80" : "text-white/40"}`}
          >
            {c.title}
            <span className="ml-1.5 tabular-nums text-white/40">
              {c.openCount}
            </span>
          </Link>
        ))}
      </div>

      {groups.length > 0 ? (
        <div className="mt-10">
          {groups.map((g) => (
            <div
              key={g.key}
              className="grid gap-x-10 border-t border-white/20 lg:grid-cols-[13rem_1fr]"
            >
              <div className="pt-5 lg:pt-6">
                <div className="lg:sticky lg:top-24">
                  <h3 className="font-serif text-4xl leading-none text-white">
                    {g.name}
                  </h3>
                  <p className="mt-2 text-sm text-white/45">
                    {g.year} · {g.items.length} program
                  </p>
                </div>
              </div>
              <div className="divide-y divide-white/10">
                {g.items.map((o) => (
                  <OpportunityRow key={o.id} opportunity={o} variant="calendar" />
                ))}
              </div>
            </div>
          ))}
          <div className="border-t border-white/20" />
        </div>
      ) : (
        <p className="mt-10 max-w-md text-lg text-white/65">
          Şu an başvuruya açık program yok. Yeni programlar eklendiğinde burada
          görünür.
        </p>
      )}

      {closedCount > 0 && (
        <p className="mt-6 text-[15px] text-white/55">
          {closedCount} programın süresi doldu.{" "}
          <Link
            href="/opportunities?durum=closed"
            className="text-white/80 underline decoration-white/30 underline-offset-4 transition hover:text-white hover:decoration-white"
          >
            Arşive bak
          </Link>
          , bir sonraki çağrı için koşulları önceden görebilirsin.
        </p>
      )}
    </section>
  );
}
