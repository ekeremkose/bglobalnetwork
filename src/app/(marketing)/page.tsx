import { getFeaturedOpportunities } from "@/lib/repositories/opportunityRepository";
import { getReels } from "@/lib/repositories/reelRepository";
import { getAnnouncements } from "@/lib/repositories/announcementRepository";
import { HomeHero } from "@/components/sections/HomeHero";
import { HomeAbout } from "@/components/sections/HomeAbout";
import { HomeFeaturedOpportunities } from "@/components/sections/HomeFeaturedOpportunities";
import { HomeReelsPreview } from "@/components/sections/HomeReelsPreview";
import { HomeAnnouncementsPreview } from "@/components/sections/HomeAnnouncementsPreview";
import { HomeCommunity } from "@/components/sections/HomeCommunity";

export default function HomePage() {
  const opportunities = getFeaturedOpportunities(3);
  const reels = getReels().slice(0, 4);
  const announcements = getAnnouncements().slice(0, 3);

  return (
    <div className="divide-y divide-white/[0.06]">
      <HomeHero />
      <HomeAbout />
      <HomeFeaturedOpportunities opportunities={opportunities} />
      <HomeReelsPreview reels={reels} />
      <HomeAnnouncementsPreview announcements={announcements} />
      <HomeCommunity />
    </div>
  );
}
