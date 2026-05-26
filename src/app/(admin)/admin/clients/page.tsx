import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus, User, Building2, ChevronRight } from "lucide-react";

type OnboardingStatus = "pendente" | "em_andamento" | "aguardando_cliente" | "concluido";

function getOnboardingLabel(phases: { status: OnboardingStatus }[] | null) {
  if (!phases || phases.length === 0) return { label: "Sem fases", variant: "muted" as const };
  const done = phases.filter((p) => p.status === "concluido").length;
  const inProgress = phases.find((p) => p.status === "em_andamento");
  const waitingClient = phases.find((p) => p.status === "aguardando_cliente");

  if (done === phases.length) return { label: "Concluído", variant: "success" as const };
  if (waitingClient) return { label: "Aguardando cliente", variant: "warning" as const };
  if (inProgress) return { label: `Fase ${inProgress ? phases.indexOf(inProgress) + 1 : "?"}`, variant: "default" as const };
  return { label: `${done}/${phases.length} fases`, variant: "muted" as const };
}

const badgeStyles: Record<string, string> = {
  success: "bg-green-500/15 text-green-400 border-green-500/20",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  default: "bg-[#771FE3]/15 text-[#8F68C1] border-[#771FE3]/20",
  muted: "bg-white/5 text-white/40 border-white/10",
};

export default async function ClientsPage() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("profiles")
    .select(`
      id,
      email,
      full_name,
      created_at,
      companies (
        id,
        name,
        instagram,
        onboarding_phases ( status )
      )
    `)
    .eq("role", "client")
    .order("created_at", { ascending: false });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Clientes</h1>
          <p className="text-white/50 mt-1">
            {clients?.length ?? 0} cliente{clients?.length !== 1 ? "s" : ""} cadastrado{clients?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/clients/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#771FE3] to-[#8F68C1] hover:from-[#6a1bcc] hover:to-[#7d5aad] text-white text-sm font-semibold rounded-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </Link>
      </div>

      {/* Client list */}
      {clients && clients.length > 0 ? (
        <div className="space-y-3">
          {clients.map((client) => {
            const company = client.companies?.[0];
            const phases = company?.onboarding_phases ?? null;
            const { label, variant } = getOnboardingLabel(phases as { status: OnboardingStatus }[] | null);
            const donePhasesCount = (phases as { status: OnboardingStatus }[] | null)?.filter((p) => p.status === "concluido").length ?? 0;
            const totalPhases = phases?.length ?? 6;

            return (
              <Link
                key={client.id}
                href={`/admin/clients/${client.id}`}
                className="flex items-center gap-4 bg-[#111111] border border-white/10 rounded-xl p-5 hover:border-[#771FE3]/30 hover:bg-[#111111]/80 transition-all duration-150 group"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#771FE3] to-[#8F68C1] flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-white truncate">
                      {company?.name || "Empresa não cadastrada"}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${badgeStyles[variant]}`}>
                      {label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/40">
                    {(client as { full_name?: string }).full_name && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {(client as { full_name?: string }).full_name}
                      </span>
                    )}
                    <span className="truncate">{client.email}</span>
                    {company?.instagram && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {company.instagram}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-white/40 mb-1">Onboarding</p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-24 h-1.5 bg-white/10 rounded-full">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-[#771FE3] to-[#8F68C1]"
                          style={{ width: `${(donePhasesCount / totalPhases) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-white/40">
                        {donePhasesCount}/{totalPhases}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-[#771FE3] transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#111111] border border-white/10 rounded-xl p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[#771FE3]/10 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-[#771FE3]/50" />
          </div>
          <p className="text-white/50 font-medium mb-1">Nenhum cliente cadastrado</p>
          <p className="text-white/30 text-sm mb-6">
            Crie o primeiro cliente para começar o onboarding.
          </p>
          <Link
            href="/admin/clients/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#771FE3] to-[#8F68C1] text-white text-sm font-semibold rounded-lg hover:from-[#6a1bcc] hover:to-[#7d5aad] transition-all"
          >
            <Plus className="w-4 h-4" />
            Criar Primeiro Cliente
          </Link>
        </div>
      )}
    </div>
  );
}
