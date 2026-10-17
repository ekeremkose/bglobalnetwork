import Link from "next/link";
import { notFound } from "next/navigation";
import { OpportunityDetail } from "@/components/opportunities/OpportunityDetail";
import { OpportunityGrid } from "@/components/opportunities/OpportunityGrid";
import { ReelGrid } from "@/components/reels/ReelGrid";
import { getOpportunityBySlug, getRelatedOpportunities } from "@/lib/repositories/opportunityRepository";
import { getReelsByIds } from "@/lib/repositories/reelRepository";

export default async function OpportunityDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const opportunity = getOpportunityBySlug(slug);
  if (!opportunity) notFound();

  const relatedReels = opportunity.relatedReelIds?.length
    ? getReelsByIds(opportunity.relatedReelIds)
    : [];
  const relatedOpportunities = getRelatedOpportunities(opportunity, 6);

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Link href="/opportunities" className="hover:text-ink">
          Projeler
        </Link>
        <span>/</span>
        <span className="line-clamp-1 text-ink">{opportunity.title}</span>
      </div>

      <OpportunityDetail opportunity={opportunity} />

      {relatedReels.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-ink">
            İlgili İçerik
          </h2>
          <ReelGrid reels={relatedReels} />
        </section>
      ) : null}

      {relatedOpportunities.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-ink">Benzer projeler</h2>
          <OpportunityGrid opportunities={relatedOpportunities} />
        </section>
      ) : null}
    </div>
  );
}

