"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ModuleType = "site_briefing" | "chatbot_briefing" | "playbook";

export async function saveModuleStep(
  moduleType: ModuleType,
  step: number,
  data: Record<string, unknown>,
  isLastStep = false
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("user_id", user.id)
    .single();
  if (!company) return { error: "Empresa não encontrada." };

  const { data: existing } = await supabase
    .from("module_submissions")
    .select("form_data")
    .eq("company_id", company.id)
    .eq("module_type", moduleType)
    .maybeSingle();

  const merged = {
    ...((existing?.form_data as Record<string, unknown>) ?? {}),
    ...data,
  };

  const { error } = await supabase
    .from("module_submissions")
    .upsert(
      {
        company_id: company.id,
        module_type: moduleType,
        form_data: merged,
        current_step: step,
        status: isLastStep ? "concluido" : "em_andamento",
        updated_at: new Date().toISOString(),
        ...(isLastStep ? { submitted_at: new Date().toISOString() } : {}),
      },
      { onConflict: "company_id,module_type" }
    );

  if (error) return { error: error.message };

  if (isLastStep) {
    const labels: Record<ModuleType, string> = {
      site_briefing: "Briefing de Site",
      chatbot_briefing: "Briefing de Chatbot",
      playbook: "Playbook Comercial",
    };
    await supabase.from("admin_notifications").insert({
      company_id: company.id,
      module_type: moduleType,
      message: `${company.name || "Cliente"} concluiu o ${labels[moduleType]}.`,
    });
    revalidatePath("/client/dashboard");
  }

  return { success: true };
}

export async function toggleModule(
  companyId: string,
  moduleType: ModuleType,
  enabled: boolean
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return { error: "Não autorizado." };

  const { data: company } = await supabase
    .from("companies")
    .select("modules_enabled")
    .eq("id", companyId)
    .single();

  const updated = {
    ...((company?.modules_enabled as Record<string, boolean>) ?? {}),
    [moduleType]: enabled,
  };

  const { error } = await supabase
    .from("companies")
    .update({ modules_enabled: updated })
    .eq("id", companyId);

  if (error) return { error: error.message };

  revalidatePath("/admin/clients");
  return { success: true };
}

export async function markAllNotificationsRead(): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("admin_notifications")
    .update({ read: true })
    .eq("read", false);

  if (error) return { error: error.message };
  revalidatePath("/admin/dashboard");
  return { success: true };
}
