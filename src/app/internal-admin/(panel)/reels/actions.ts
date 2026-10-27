"use server";

import type { Reel } from "@/lib/types/content";
import type { MutationResult, SaveResult } from "@/lib/admin/common";
import { removeReel, saveReel, setReelStatus } from "@/lib/admin/reelService";
import { guard } from "@/lib/admin/revalidate";

export async function saveReelAction(input: unknown): Promise<SaveResult<Reel>> {
  return guard(() => saveReel(input), (message) => ({ ok: false, message }));
}

export async function setReelStatusAction(
  id: string,
  status: "draft" | "published"
): Promise<SaveResult<Reel>> {
  return guard(() => setReelStatus(id, status), (message) => ({ ok: false, message }));
}

export async function deleteReelAction(id: string): Promise<MutationResult<Reel>> {
  return guard(() => removeReel(id), (message) => ({ ok: false, message }));
}
