import { getOpportunities } from "@/lib/repositories/opportunityRepository";
import { getReels } from "@/lib/repositories/reelRepository";
import { getAnnouncements } from "@/lib/repositories/announcementRepository";
import { getCategories } from "@/lib/repositories/categoryRepository";
import { getDeadlineStatus } from "@/lib/utils/date";
import { sortReelsForSite } from "@/lib/utils/reels";
import { HomeHero } from "@/components/sections/HomeHero";
import { HomeCalendar } from "@/components/sections/HomeCalendar";
import { HomeReels } from "@/components/sections/HomeReels";
import { HomeUpdates } from "@/components/sections/HomeUpdates";
import { HomeCommunity } from "@/components/sections/HomeCommunity";

// Deadlines and "N gün kaldı" depend on today's date, so the page must not stay frozen.
export const revalidate = 3600;

export default async function HomePage() {
  const all = await getOpportunities();
  const byDeadline = (a: { deadline: string }, b: { deadline: string }) =>
    new Date(a.deadline).getTime() - new Date(b.deadline).getTime();

  const open = all
    .filter((o) => getDeadlineStatus(o.deadline) !== "closed")
    .sort(byDeadline);
  const closedCount = all.length - open.length;

  const categories = getCategories().map((c) => ({
    ...c,
    openCount: open.filter((o) => o.category === c.slug).length,
  }));

  // Lead Reel: an explicit featured choice, then the newest (see sortReelsForSite).
  const [reelLead, ...reelRest] = sortReelsForSite(await getReels());

  const dateline = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
    timeZone: "Europe/Istanbul",
  }).format(new Date());

  const announcements = (await getAnnouncements())
    .slice()
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, 3);

  return (
    <div>
      <HomeHero open={open} closedCount={closedCount} dateline={dateline} />
      <HomeCalendar
        open={open}
        closedCount={closedCount}
        categories={categories}
      />
      {reelLead && <HomeReels lead={reelLead} more={reelRest.slice(0, 3)} />}
      <HomeUpdates announcements={announcements} />
      <HomeCommunity />
    </div>
  );
}
