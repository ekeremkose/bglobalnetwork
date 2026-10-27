import { getAllOpportunities } from "@/lib/store/opportunityStore";
import { getAllReels } from "@/lib/store/reelStore";
import { getAllAnnouncements } from "@/lib/store/announcementStore";

/**
 * Admin read path: every record, drafts included. Only the admin pages and
 * server actions may import this module.
 */
const byUpdated = <T extends { updatedAt?: string }>(a: T, b: T) =>
  (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "");

export const adminListOpportunities = async () => (await getAllOpportunities()).sort(byUpdated);
export const adminListReels = async () => (await getAllReels()).sort(byUpdated);
export const adminListAnnouncements = async () => (await getAllAnnouncements()).sort(byUpdated);
