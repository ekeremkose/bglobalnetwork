"use server";

import { saveSettings, type SettingsResult } from "@/lib/admin/settingsService";
import { guard } from "@/lib/admin/revalidate";

export async function saveSettingsAction(input: unknown): Promise<SettingsResult> {
  return guard(() => saveSettings(input), (message) => ({ ok: false, message }));
}
