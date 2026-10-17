import type { Opportunity } from "@/lib/types/content";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";

export function OpportunityGrid({
  opportunities
}: {
  opportunities: Opportunity[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {opportunities.map((o) => (
        <OpportunityCard key={o.id} opportunity={o} />
      ))}
    </div>
  );
}

