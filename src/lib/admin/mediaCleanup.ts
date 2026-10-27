import { deleteManagedBlob, isOwnedCoverUrl } from "@/lib/media/blob";
import { getAllReels } from "@/lib/store/reelStore";
import { getAllOpportunities } from "@/lib/store/opportunityStore";
import { getAllAnnouncements } from "@/lib/store/announcementStore";

/**
 * Deletes a cover file we uploaded once no record points at it any more. Call it after the record
 * that used the file has been saved or removed. A cover can also be pasted by hand into another
 * record, so the file is kept while anything still references it; if that check cannot be made the
 * file is kept too (an orphan costs a few KB, a deleted live cover breaks a page).
 */
export async function releaseCover(url: string | undefined) {
  if (!isOwnedCoverUrl(url)) return;
  try {
    const [reels, opportunities, announcements] = await Promise.all([
      getAllReels(),
      getAllOpportunities(),
      getAllAnnouncements(),
    ]);
    const inUse =
      reels.some((r) => r.thumbnail === url) ||
      opportunities.some((o) => o.coverImage === url) ||
      announcements.some((a) => a.coverImage === url);
    if (inUse) return;
  } catch (err) {
    console.error("[media] reference check failed; file kept", err instanceof Error ? err.message : "error");
    return;
  }
  await deleteManagedBlob(url);
}
