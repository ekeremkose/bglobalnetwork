import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNavbar } from "@/components/site/SiteNavbar";
import { getSiteSettings } from "@/lib/repositories/settingsRepository";

export default async function MarketingLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();
  return (
    <div className="relative overflow-x-clip">
      <SiteNavbar communityFormUrl={settings.communityFormUrl} />
      <main className="mx-auto w-full max-w-6xl px-4 pb-0 pt-0 sm:px-6 lg:px-8">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
