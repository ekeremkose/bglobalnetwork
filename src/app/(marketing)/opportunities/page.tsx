import { OpportunitiesPageClient } from "@/components/pages/OpportunitiesPageClient";
import { getOpportunities } from "@/lib/repositories/opportunityRepository";
import { getCategories } from "@/lib/repositories/categoryRepository";
import { getCountries } from "@/lib/repositories/countryRepository";

export default function OpportunitiesPage() {
  const opportunities = getOpportunities();
  const categories = getCategories();
  const countries = getCountries();

  return (
    <OpportunitiesPageClient
      opportunities={opportunities}
      categories={categories}
      countries={countries}
    />
  );
}

