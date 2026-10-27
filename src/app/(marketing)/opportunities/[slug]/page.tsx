import Link from "next/link";
import { notFound } from "next/navigation";
import { OpportunityDetail } from "@/components/opportunities/OpportunityDetail";
import {
  OpportunityRow,
  OpportunityTableHead,
} from "@/components/opportunities/OpportunityRow";
import {
  getOpportunityBySlug,
  getRelatedOpportunities,
} from "@/lib/repositories/opportunityRepository";
import { getReelsByIds } from "@/lib/repositories/reelRepository";
import { getDeadlineStatus } from "@/lib/utils/date";

export const revalidate = 3600;

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const opportunity = await getOpportunityBySlug(slug);
  if (!opportunity) notFound();

  const relatedReels = opportunity.relatedReelIds?.length
    ? await getReelsByIds(opportunity.relatedReelIds)
    : [];
  // Open programs first, so "similar" never leads with something you can't apply to.
  const relatedOpportunities = (await getRelatedOpportunities(opportunity, 12))
    .sort(
      (a, b) =>
        Number(getDeadlineStatus(a.deadline) === "closed") -
        Number(getDeadlineStatus(b.deadline) === "closed")
    )
    .slice(0, 4);

  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <div className="mb-8 flex items-center gap-2 text-[15px] text-white/50">
        <Link href="/opportunities" className="transition hover:text-white">
          Projeler
        </Link>
        <span aria-hidden>/</span>
        <span className="line-clamp-1 text-white/75">{opportunity.title}</span>
      </div>

      <OpportunityDetail opportunity={opportunity} />

      {relatedReels.length > 0 && (
        <section className="mt-20 border-t border-white/10 pt-10">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-white">
            İlgili içerik
          </h2>
          <ul className="mt-6 max-w-2xl divide-y divide-white/10 border-y border-white/10">
            {relatedReels.map((r) => (
              <li key={r.id}>
                <a
                  href={r.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group block py-5"
                >
                  <span className="text-sm font-medium text-brand-300">
                    {r.tag}
                  </span>
                  <span className="mt-1 block text-xl font-semibold text-white underline decoration-white/0 underline-offset-4 transition group-hover:decoration-white/40">
                    {r.title} ↗
                  </span>
                  <span className="mt-1.5 block text-[15px] text-white/55">
                    {r.shortDescription}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {relatedOpportunities.length > 0 && (
        <section className="mt-20 border-t border-white/10 pt-10">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-white">
            Benzer programlar
          </h2>
          <div className="mt-6">
            <OpportunityTableHead />
            {relatedOpportunities.map((o) => (
              <OpportunityRow key={o.id} opportunity={o} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
