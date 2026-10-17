import { ReviewDashboardClient } from "@/components/admin/ReviewDashboardClient";
import { getFoundOpportunityCandidates } from "@/lib/repositories/foundOpportunityRepository";

export const metadata = {
  title: "Review Opportunities"
};

export default function AdminReviewPage() {
  const initialItems = getFoundOpportunityCandidates();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <ReviewDashboardClient initialItems={initialItems} />
    </div>
  );
}
