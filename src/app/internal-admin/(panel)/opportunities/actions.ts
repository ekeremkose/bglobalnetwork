"use server";

import type { Opportunity } from "@/lib/types/content";
import type { MutationResult, SaveResult } from "@/lib/admin/common";
import {
  removeOpportunity,
  saveOpportunity,
  setOpportunityStatus,
} from "@/lib/admin/opportunityService";
import { guard } from "@/lib/admin/revalidate";

export async function saveOpportunityAction(input: unknown): Promise<SaveResult<Opportunity>> {
  return guard(() => saveOpportunity(input), (message) => ({ ok: false, message }));
}

export async function setOpportunityStatusAction(
  id: string,
  status: "draft" | "published"
): Promise<SaveResult<Opportunity>> {
  return guard(() => setOpportunityStatus(id, status), (message) => ({ ok: false, message }));
}

export async function deleteOpportunityAction(id: string): Promise<MutationResult<Opportunity>> {
  return guard(() => removeOpportunity(id), (message) => ({ ok: false, message }));
}
