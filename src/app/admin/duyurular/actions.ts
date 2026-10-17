"use server";

import { revalidatePath } from "next/cache";
import type { Announcement } from "@/lib/types/content";
import { addAnnouncement, updateAnnouncement, removeAnnouncement } from "@/lib/store/announcementStore";

export async function createAnnouncement(data: Announcement): Promise<void> {
  addAnnouncement(data);
  revalidatePath("/duyurular");
  revalidatePath("/");
  revalidatePath("/admin/duyurular");
}

export async function saveAnnouncement(data: Announcement): Promise<void> {
  updateAnnouncement(data);
  revalidatePath("/duyurular");
  revalidatePath("/");
  revalidatePath("/admin/duyurular");
}

export async function deleteAnnouncement(id: string): Promise<void> {
  removeAnnouncement(id);
  revalidatePath("/duyurular");
  revalidatePath("/");
  revalidatePath("/admin/duyurular");
}
