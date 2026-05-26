import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Circle,
  AlertCircle,
  Calendar,
  ClipboardList,
} from "lucide-react";

const statusConfig = {
  pendente: {
    label: "Pendente",
    icon: Circle,
    color: "text-white/20",
    badge: "bg-white/5 text-white/30 border-white/10",
    bar: "bg-white/10",
  },
  em_andamento: {
    label: "Em andamento",
    icon: Clock,
    color: "text-[#771FE3]",
    badge: "bg-[#771FE3]/15 text-[#8F68C1] border-[#771FE3]/20",
    bar: "bg-gradient-to-r from-[#771FE3] to-[#8F68C1]",
  },
  aguardando_cliente: {
    label: "Sua vez",
    icon: AlertCircle,
    color: "text-amber-400",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    bar: "bg-amber-400",
  },
  concluido: {
    label: "Concluído",
    icon: CheckCircle2,
    color: "text-green-400",
    badge: "bg-green-500/15 text-green-400 border-green-500/20",
    bar: "bg-green-400",
  },
} as const;

type StatusKey = keyof typeof statusConfig;

const phaseDescriptions: Record<number, string> = {
  1: "Posicionamento no Instagram e Facebook, posts fixados, organização da bio e Google Meu Negócio.",
  2: "Apresentação de tudo que foi criado. Agendada após conclusão da Fase 1.",
  3: "Alterações solicitadas na reunião de vinculação. Entrega para aprovação final.",
  4: "Aprovação de todas as entregas e coleta de acessos para início das campanhas.",
  5: "Levantamento e criação das campanhas de tráfego pago.",
  6: "Segunda: relatório semanal. Quarta: acompanhamento. Sexta: checklist semanal.",
};

export default async function ClientOnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("user_id", user.id)
    .single();

  if (!company) redirect("/client/dashboard");

  const { data: phases } = await supabase
    .from("onboarding_phases")
    .select("*")
    .eq("company_id", company.id)
    .order("phase_number");

  const completedCount = phases?.filter((p) => p.status === "concluido").length ?? 0;
  const total = phases?.length ?? 6;
  const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const activePhase = phases?.find((p) => p.status === "em_andamento" || p.status === "aguardando_cliente");

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#771FE3] to-[#8F68C1]">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Onboarding</h1>
        </div>
        <p className="text-white/40 text-sm">
          Acompanhe cada fase do seu processo de entrada na Viccari Ads.
        </p>
      </div>

      {/* Progress summary */}
      <div className="bg-[#111111] border border-white/10 rounded-xl p-6 mb-6">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
              Progresso geral
            </p>
            <p className="text-3xl font-bold text-white">{progressPct}%</p>
          </div>
          <p className="text-white/40 text-sm">
            {completedCount} de {total} fases concluídas
          </p>
        </div>
        <div className="h-2 bg-white/10 rounded-full">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-[#771FE3] to-[#8F68C1] transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {activePhase && (
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#771FE3] animate-pulse" />
            <p className="text-sm text-white/60">
              Fase em andamento:{" "}
              <span className="text-white font-medium">
                {activePhase.phase_number} — {activePhase.phase_name}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Phase timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10" />

        <div className="space-y-3">
          {phases?.map((phase) => {
            const key = phase.status as StatusKey;
            const config = statusConfig[key] ?? statusConfig.pendente;
            const Icon = config.icon;
            return (
              <div key={phase.id} className="relative flex gap-4">
                {/* Icon node */}
                <div
                  className={`relative z-10 w-12 h-12 flex-shrink-0 rounded-full border-2 flex items-center justify-center bg-[#000000] ${
                    key === "concluido"
                      ? "border-green-400/40"
                      : key === "em_andamento"
                      ? "border-[#771FE3]/60"
                      : key === "aguardando_cliente"
                      ? "border-amber-400/40"
                      : "border-white/10"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>

                {/* Card */}
                <div
                  className={`flex-1 bg-[#111111] border rounded-xl p-4 mb-1 transition-all ${
                    key === "em_andamento"
                      ? "border-[#771FE3]/30"
                      : key === "aguardando_cliente"
                      ? "border-amber-400/30"
                      : "border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3
                      className={`font-semibold text-sm ${
                        key === "concluido" ? "text-white/40 line-through" : "text-white"
                      }`}
                    >
                      Fase {phase.phase_number} — {phase.phase_name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${config.badge}`}
                    >
                      {config.label}
                    </span>
                  </div>

                  <p className="text-xs text-white/40 leading-relaxed">
                    {phaseDescriptions[phase.phase_number] ?? ""}
                  </p>

                  {/* Deadline */}
                  {phase.deadline && (
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <Calendar className="w-3 h-3 text-white/30" />
                      <span className="text-xs text-white/30">
                        Prazo:{" "}
                        {new Date(phase.deadline + "T00:00:00").toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}

                  {/* Notes (only show client-facing notes if available) */}
                  {phase.notes && key === "aguardando_cliente" && (
                    <div className="mt-3 p-3 bg-amber-500/5 border border-amber-500/15 rounded-lg">
                      <p className="text-xs text-amber-400/80 leading-relaxed">
                        {phase.notes}
                      </p>
                    </div>
                  )}

                  {/* Completed date */}
                  {phase.completed_at && (
                    <p className="text-xs text-green-400/50 mt-2">
                      Concluído em{" "}
                      {new Date(phase.completed_at).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
