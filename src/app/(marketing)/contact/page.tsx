import { ContactPageClient } from "@/components/pages/ContactPageClient";
import { getSiteSettings } from "@/lib/repositories/settingsRepository";

export const metadata = {
  title: "İletişim"
};

export const revalidate = 3600;

export default async function ContactPage() {
  return <ContactPageClient site={await getSiteSettings()} />;
}

