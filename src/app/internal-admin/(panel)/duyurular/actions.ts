"use server";

import type { Announcement } from "@/lib/types/content";
import type { MutationResult, SaveResult } from "@/lib/admin/common";
import { removePost, savePost, setPostStatus } from "@/lib/admin/blogService";
import { guard } from "@/lib/admin/revalidate";

export async function savePostAction(input: unknown): Promise<SaveResult<Announcement>> {
  return guard(() => savePost(input), (message) => ({ ok: false, message }));
}

export async function setPostStatusAction(
  id: string,
  status: "draft" | "published"
): Promise<SaveResult<Announcement>> {
  return guard(() => setPostStatus(id, status), (message) => ({ ok: false, message }));
}

export async function deletePostAction(id: string): Promise<MutationResult<Announcement>> {
  return guard(() => removePost(id), (message) => ({ ok: false, message }));
}
