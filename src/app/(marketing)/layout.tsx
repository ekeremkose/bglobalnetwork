import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNavbar } from "@/components/site/SiteNavbar";

export default function MarketingLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative">
      <SiteNavbar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-0 pt-0 sm:px-6 lg:px-8">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
