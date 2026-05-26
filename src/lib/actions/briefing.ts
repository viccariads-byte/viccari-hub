"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateBrandBrain } from "./brand-brain";

export type StepData = Record<string, string | string[]>;

export async function saveBriefingStep(
  step: number,
  data: StepData,
  isLastStep: boolean = false
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!company) return { error: "Empresa não encontrada." };

  const companyId = company.id;

  if (step === 1) {
    await supabase.from("companies").update({
      name: (data.nome_empresa as string) || null,
      instagram: (data.instagram as string) || null,
      city: (data.cidade as string) || null,
    }).eq("id", companyId);
  }

  const { data: existing } = await supabase
    .from("briefing_answers")
    .select("briefing_data")
    .eq("company_id", companyId)
    .maybeSingle();

  const merged = {
    ...((existing?.briefing_data as Record<string, unknown>) || {}),
    ...data,
  };

  const { error } = await supabase
    .from("briefing_answers")
    .upsert(
      {
        company_id: companyId,
        briefing_data: merged,
        current_step: step,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "company_id" }
    );

  if (error) return { error: error.message };

  if (isLastStep) {
    generateBrandBrain(companyId).catch(() => null);
    revalidatePath("/client/dashboard");
    revalidatePath("/client/briefing");
  }

  return { success: true };
}
