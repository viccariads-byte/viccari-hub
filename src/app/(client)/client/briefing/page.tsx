import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BriefingForm } from "@/components/client/BriefingForm";

export default async function BriefingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!company) {
    return (
      <div className="max-w-lg">
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-[#771FE3]/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⏳</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Conta em configuração</h2>
          <p className="text-white/50 text-sm">
            A equipe da Viccari Ads está configurando sua conta. Em breve você
            receberá acesso completo ao seu portal.
          </p>
        </div>
      </div>
    );
  }

  const { data: briefing } = await supabase
    .from("briefing_answers")
    .select("briefing_data, current_step")
    .eq("company_id", company.id)
    .maybeSingle();

  const isOnboarding = (briefing?.current_step ?? 0) < 5;

  return (
    <BriefingForm
      existingData={(briefing?.briefing_data as Record<string, unknown>) ?? null}
      savedStep={briefing?.current_step ?? 1}
      isOnboarding={isOnboarding}
    />
  );
}
