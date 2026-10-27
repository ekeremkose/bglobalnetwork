import { OpportunitiesPageClient } from "@/components/pages/OpportunitiesPageClient";
import { getOpportunities } from "@/lib/repositories/opportunityRepository";
import { getCategories } from "@/lib/repositories/categoryRepository";
import { getCountries } from "@/lib/repositories/countryRepository";

export const revalidate = 3600;

export default async function OpportunitiesPage() {
  const opportunities = await getOpportunities();
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

