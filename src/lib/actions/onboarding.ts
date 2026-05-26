"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { OnboardingStatus } from "@/lib/types/database";

export async function updateOnboardingPhase(
  phaseId: string,
  companyUserId: string,
  data: {
    status: OnboardingStatus;
    notes?: string;
    deadline?: string;
  }
) {
  const supabase = await createClient();

  const updates: Record<string, unknown> = {
    status: data.status,
    notes: data.notes ?? null,
    deadline: data.deadline || null,
    updated_at: new Date().toISOString(),
  };

  if (data.status === "concluido") {
    updates.completed_at = new Date().toISOString();
  } else {
    updates.completed_at = null;
  }

  const { error } = await supabase
    .from("onboarding_phases")
    .update(updates)
    .eq("id", phaseId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/clients/${companyUserId}`);
  return { success: true };
}
