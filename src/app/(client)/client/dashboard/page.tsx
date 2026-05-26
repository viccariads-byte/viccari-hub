import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ClipboardList,
  Calendar,
  CheckCircle2,
  Clock,
  Circle,
  AlertCircle,
  FileText,
  ArrowRight,
} from "lucide-react";
import { checkAndUnlockAchievements } from "@/lib/actions/achievements";
import { AchievementsBlock } from "@/components/client/AchievementsBlock";

export default async function ClientDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: company }, { data: profile }] = await Promise.all([
    supabase.from("companies").select("id, name").eq("user_id", user.id).single(),
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
  ]);

  // No company yet: show a minimal holding page
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
            receberá acesso completo ao portal.
          </p>
        </div>
      </div>
    );
  }

  const [{ data: briefing }, { data: onboardingPhases }, achievements] = await Promise.all([
    supabase
      .from("briefing_answers")
      .select("id")
      .eq("company_id", company.id)
      .maybeSingle(),
    supabase
      .from("onboarding_phases")
      .select("*")
      .eq("company_id", company.id)
      .order("phase_number"),
    checkAndUnlockAchievements(company.id),
  ]);

  const hasBriefing = !!briefing;
  const completedPhases =
    onboardingPhases?.filter((p) => p.status === "concluido").length ?? 0;
  const totalPhases = onboardingPhases?.length ?? 6;

  const statusIcon = {
    concluido: CheckCircle2,
    em_andamento: Clock,
    aguardando_cliente: AlertCircle,
    pendente: Circle,
  } as Record<string, React.ElementType>;

  const statusColor = {
    concluido: "text-green-400",
    em_andamento: "text-[#771FE3]",
    aguardando_cliente: "text-amber-400",
    pendente: "text-white/20",
  } as Record<string, string>;

  const statusBadge = {
    concluido: "",
    em_andamento: "bg-[#771FE3]/15 text-[#8F68C1] border border-[#771FE3]/20",
    aguardando_cliente: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    pendente: "",
  } as Record<string, string>;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Olá, {profile?.full_name?.split(" ")[0] || company.name || "Cliente"} 👋
        </h1>
        <p className="text-white/50 mt-1">
          Acompanhe seu onboarding e conteúdos aqui.
        </p>
      </div>

      {/* Briefing pending alert */}
      {!hasBriefing && (
        <Link
          href="/client/briefing"
          className="flex items-center justify-between bg-[#771FE3]/10 border border-[#771FE3]/30 rounded-xl p-5 mb-6 hover:bg-[#771FE3]/15 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#771FE3]/20">
              <FileText className="w-5 h-5 text-[#771FE3]" />
            </div>
            <div>
              <p className="font-semibold text-white">Briefing pendente</p>
              <p className="text-white/50 text-sm">
                Preencha o briefing para ativar sua estratégia de conteúdo.
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-[#771FE3] group-hover:translate-x-1 transition-transform" />
        </Link>
      )}

      {/* Onboarding progress */}
      <div className="bg-[#111111] border border-white/10 rounded-xl p-6 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Progresso do Onboarding
          </h2>
          <span className="text-sm text-[#8F68C1] font-medium">
            {completedPhases}/{totalPhases} fases
          </span>
        </div>

        <div className="h-2 bg-white/10 rounded-full mb-5">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-[#771FE3] to-[#8F68C1] transition-all duration-500"
            style={{
              width: `${totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0}%`,
            }}
          />
        </div>

        <div className="space-y-2.5">
          {onboardingPhases && onboardingPhases.length > 0 ? (
            onboardingPhases.map((phase) => {
              const Icon = statusIcon[phase.status] ?? Circle;
              return (
                <div
                  key={phase.id}
                  className="flex items-center gap-3 text-sm py-1"
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${statusColor[phase.status] ?? "text-white/20"}`}
                  />
                  <span
                    className={
                      phase.status === "concluido"
                        ? "text-white/40 line-through"
                        : "text-white"
                    }
                  >
                    Fase {phase.phase_number} — {phase.phase_name}
                  </span>
                  {statusBadge[phase.status] && (
                    <span
                      className={`ml-auto text-xs px-2 py-0.5 rounded-full ${statusBadge[phase.status]}`}
                    >
                      {phase.status === "aguardando_cliente"
                        ? "Sua vez"
                        : "Em andamento"}
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-white/30 text-sm text-center py-4">
              Fases do onboarding serão exibidas em breve.
            </p>
          )}
        </div>
      </div>

      {/* Achievements */}
      <AchievementsBlock
        unlocked={achievements.unlocked ?? []}
        newlyUnlocked={achievements.newlyUnlocked ?? []}
      />

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/client/briefing"
          className="bg-[#111111] border border-white/10 rounded-xl p-5 hover:border-[#771FE3]/30 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#771FE3] to-[#8F68C1]">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-white">
              {hasBriefing ? "Ver Briefing" : "Preencher Briefing"}
            </h3>
          </div>
          <p className="text-white/40 text-sm">
            {hasBriefing
              ? "Revise ou atualize as informações da sua marca."
              : "Ative sua estratégia preenchendo o briefing."}
          </p>
        </Link>

        <Link
          href="/client/calendar"
          className="bg-[#111111] border border-white/10 rounded-xl p-5 hover:border-[#771FE3]/30 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#8F68C1] to-[#771FE3]">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-white">Calendário de Conteúdo</h3>
          </div>
          <p className="text-white/40 text-sm">
            Visualize todos os seus conteúdos do mês.
          </p>
        </Link>

        <Link
          href="/client/onboarding"
          className="bg-[#111111] border border-white/10 rounded-xl p-5 hover:border-[#771FE3]/30 transition-colors group md:col-span-2"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#771FE3] to-[#8F68C1]">
              <ClipboardList className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-white">Acompanhar Onboarding</h3>
          </div>
          <p className="text-white/40 text-sm">
            Veja o status detalhado de cada fase do seu processo.
          </p>
        </Link>
      </div>
    </div>
  );
}
