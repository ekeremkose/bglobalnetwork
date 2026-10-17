import { OpportunitiesAdminClient } from "@/components/admin/OpportunitiesAdminClient";
import { getOpportunities } from "@/lib/repositories/opportunityRepository";

export const metadata = { title: "Projeler — Admin" };

export default function AdminOpportunitiesPage() {
  const items = getOpportunities();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <OpportunitiesAdminClient initialItems={items} />
    </div>
  );
}
