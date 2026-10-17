"use server";

import { revalidatePath } from "next/cache";
import type { Opportunity } from "@/lib/types/content";
import type { ReviewStatus } from "@/lib/types/foundOpportunity";
import { addOpportunity } from "@/lib/store/opportunityStore";
import { setCandidateStatus } from "@/lib/store/foundOpportunityStore";

/**
 * Publishes an approved opportunity to the live store.
 * Mock phase: writes to in-memory store.
 * Future: replace with DB/CMS write, keep this function signature.
 */
export async function publishOpportunity(opportunity: Opportunity, candidateId: string): Promise<void> {
  addOpportunity(opportunity);
  setCandidateStatus(candidateId, "approved");
  revalidatePath("/opportunities");
  revalidatePath("/");
}

export async function updateCandidateStatus(id: string, status: ReviewStatus): Promise<void> {
  setCandidateStatus(id, status);
}
