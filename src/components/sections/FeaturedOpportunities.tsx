import Link from "next/link";
import { getFeaturedOpportunities } from "@/lib/repositories/opportunityRepository";
import { OpportunityGrid } from "@/components/opportunities/OpportunityGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function FeaturedOpportunities() {
  const featured = getFeaturedOpportunities(6);
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="Öne çıkanlar"
          title="Bu hafta popüler fırsatlar"
          description="Hızlı başvuru için son tarihlere dikkat ederek planla."
        />
        <Link
          href="/opportunities"
          className="inline-flex items-center text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          Tüm fırsatlar →
        </Link>
      </div>
      <OpportunityGrid opportunities={featured} />
    </section>
  );
}

