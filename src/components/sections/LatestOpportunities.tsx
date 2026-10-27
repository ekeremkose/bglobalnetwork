import Link from "next/link";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { getLatestOpportunities } from "@/lib/repositories/opportunityRepository";

export async function LatestOpportunities() {
  const latest = await getLatestOpportunities(4);

  return (
    <section className="py-16 sm:py-20">
      <div className="mb-10 flex items-center gap-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/25">
          Son paylaşımlar
        </span>
        <div className="h-px flex-1 bg-white/[0.06]" />
        <Link
          href="/opportunities"
          className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/25 transition hover:text-white/60"
        >
          Tümünü gör →
        </Link>
      </div>

      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Fırsatlar burada:<br className="sm:hidden" /> hızlıca incele
      </h2>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {latest.map((o) => (
          <OpportunityCard key={o.id} opportunity={o} />
        ))}

        <Link
          href="/opportunities"
          className="group flex min-h-[220px] flex-col justify-end rounded-lg border border-white/8 p-5 transition hover:border-white/15 hover:bg-white/3"
          aria-label="Daha fazla fırsat gör"
        >
          <span className="text-4xl font-bold text-white/15 transition group-hover:text-white/30">
            →
          </span>
          <div className="mt-5 text-sm font-semibold text-white/50 transition group-hover:text-white/80">
            Tüm fırsatlar
          </div>
          <div className="mt-0.5 text-xs text-white/25">
            Filtrele & keşfet
          </div>
        </Link>
      </div>
    </section>
  );
}
