"use server";

import { revalidatePath } from "next/cache";
import type { Reel } from "@/lib/types/content";
import { addReel, updateReel, removeReel } from "@/lib/store/reelStore";

export async function createReel(data: Reel): Promise<void> {
  addReel(data);
  revalidatePath("/reels");
  revalidatePath("/");
  revalidatePath("/admin/reels");
}

export async function saveReel(data: Reel): Promise<void> {
  updateReel(data);
  revalidatePath("/reels");
  revalidatePath("/");
  revalidatePath("/admin/reels");
}

export async function deleteReel(id: string): Promise<void> {
  removeReel(id);
  revalidatePath("/reels");
  revalidatePath("/");
  revalidatePath("/admin/reels");
}

export async function fetchInstagramThumbnail(url: string): Promise<string | null> {
  try {
    const endpoint = `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(endpoint, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.thumbnail_url as string) ?? null;
  } catch {
    return null;
  }
}
