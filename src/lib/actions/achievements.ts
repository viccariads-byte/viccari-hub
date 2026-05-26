"use server";

import { createClient } from "@/lib/supabase/server";

export interface Achievement {
  achievement_key: string;
  unlocked_at: string;
}

export const ACHIEVEMENT_DEFS = [
  { key: "briefing_complete", emoji: "🎯", name: "Briefing Completo", desc: "Finalizou o briefing da marca" },
  { key: "first_content", emoji: "📅", name: "Primeiro Conteúdo", desc: "Primeiro roteiro gerado" },
  { key: "first_approval", emoji: "✅", name: "Primeira Aprovação", desc: "Aprovou o primeiro conteúdo" },
  { key: "campaigns_live", emoji: "🚀", name: "Campanhas no Ar", desc: "Onboarding chegou à fase de lançamento" },
  { key: "playbook_unlocked", emoji: "📖", name: "Playbook Desbloqueado", desc: "Playbook Comercial disponível" },
  { key: "3_months", emoji: "💜", name: "3 Meses Juntos", desc: "3 meses de parceria com a Viccari" },
  { key: "6_months", emoji: "🌟", name: "6 Meses Juntos", desc: "6 meses de parceria com a Viccari" },
  { key: "1_year", emoji: "🏆", name: "1 Ano Juntos", desc: "1 ano de parceria com a Viccari" },
  { key: "first_referral", emoji: "🤝", name: "Primeira Indicação", desc: "Registrou a primeira indicação" },
  { key: "referral_closed", emoji: "💸", name: "Indicação Fechada", desc: "Uma indicação virou cliente Viccari" },
] as const;

export async function checkAndUnlockAchievements(
  companyId: string
): Promise<{ unlocked: Achievement[]; newlyUnlocked: string[] }> {
  const supabase = await createClient();

  const [
    { data: existing },
    { data: briefing },
    { data: contents },
    { data: approved },
    { data: onboarding },
    { data: playbook },
    { data: company },
    { data: referrals },
    { data: closedReferrals },
  ] = await Promise.all([
    supabase
      .from("company_achievements")
      .select("achievement_key, unlocked_at")
      .eq("company_id", companyId),
    supabase
      .from("briefing_answers")
      .select("current_step")
      .eq("company_id", companyId)
      .maybeSingle(),
    supabase
      .from("generated_contents")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId),
    supabase
      .from("generated_contents")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("status", "aprovado"),
    supabase
      .from("onboarding_phases")
      .select("phase_number, status")
      .eq("company_id", companyId),
    supabase
      .from("playbooks")
      .select("id")
      .eq("company_id", companyId)
      .maybeSingle(),
    supabase
      .from("companies")
      .select("created_at, modules_enabled")
      .eq("id", companyId)
      .single(),
    supabase
      .from("referrals")
      .select("id", { count: "exact", head: true })
      .eq("referrer_company_id", companyId),
    supabase
      .from("referrals")
      .select("id", { count: "exact", head: true })
      .eq("referrer_company_id", companyId)
      .eq("status", "fechado"),
  ]);

  const unlockedSet = new Set(existing?.map((a) => a.achievement_key) ?? []);

  const now = Date.now();
  const createdAt = company?.created_at ? new Date(company.created_at).getTime() : now;
  const daysSince = (now - createdAt) / (1000 * 60 * 60 * 24);
  const modulesEnabled = (company?.modules_enabled as Record<string, boolean>) ?? {};

  const conditions: Record<string, boolean> = {
    briefing_complete: (briefing?.current_step ?? 0) >= 5,
    first_content: (contents as { count?: number } | null)?.count ? true : false,
    first_approval: (approved as { count?: number } | null)?.count ? true : false,
    campaigns_live: !!onboarding?.some(
      (p) => p.phase_number >= 4 && p.status === "concluido"
    ),
    playbook_unlocked:
      !!playbook && (modulesEnabled.playbook === true),
    "3_months": daysSince >= 90,
    "6_months": daysSince >= 180,
    "1_year": daysSince >= 365,
    first_referral: (referrals as { count?: number } | null)?.count ? true : false,
    referral_closed: (closedReferrals as { count?: number } | null)?.count ? true : false,
  };

  const toInsert = Object.entries(conditions)
    .filter(([key, passes]) => passes && !unlockedSet.has(key))
    .map(([key]) => ({
      company_id: companyId,
      achievement_key: key,
      unlocked_at: new Date().toISOString(),
    }));

  let newlyUnlocked: string[] = [];

  if (toInsert.length > 0) {
    const { data: inserted } = await supabase
      .from("company_achievements")
      .upsert(toInsert, {
        onConflict: "company_id,achievement_key",
        ignoreDuplicates: true,
      })
      .select("achievement_key");

    newlyUnlocked = inserted?.map((r) => r.achievement_key) ?? toInsert.map((r) => r.achievement_key);
  }

  const { data: allUnlocked } = await supabase
    .from("company_achievements")
    .select("achievement_key, unlocked_at")
    .eq("company_id", companyId);

  return {
    unlocked: (allUnlocked ?? []) as Achievement[],
    newlyUnlocked,
  };
}
