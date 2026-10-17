"use server";

import { revalidatePath } from "next/cache";
import type { Opportunity } from "@/lib/types/content";
import {
  addOpportunity,
  updateOpportunity,
  removeOpportunity,
} from "@/lib/store/opportunityStore";

export async function createOpportunity(data: Opportunity): Promise<void> {
  addOpportunity(data);
  revalidatePath("/opportunities");
  revalidatePath("/");
  revalidatePath("/admin/opportunities");
}

export async function saveOpportunity(data: Opportunity): Promise<void> {
  updateOpportunity(data);
  revalidatePath("/opportunities");
  revalidatePath("/");
  revalidatePath("/admin/opportunities");
}

export async function deleteOpportunity(id: string): Promise<void> {
  removeOpportunity(id);
  revalidatePath("/opportunities");
  revalidatePath("/");
  revalidatePath("/admin/opportunities");
}
