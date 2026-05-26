import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Megaphone,
  Search,
  Paintbrush,
  Database,
  BarChart2,
  Monitor,
  Bot,
  FileText,
  Layers,
} from "lucide-react";

const SERVICE_ICONS: Record<string, React.ElementType> = {
  "Meta Ads": Megaphone,
  "Google Ads": Search,
  "Design de Criativos": Paintbrush,
  "CRM": Database,
  "Gestão de Tráfego": BarChart2,
  "Site": Monitor,
  "Chatbot": Bot,
  "LP IA": FileText,
};

const STATUS_CONFIG = {
  ativo: { label: "Ativo", className: "bg-green-500/15 text-green-400 border-green-500/20" },
  em_configuracao: { label: "Em configuração", className: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  pausado: { label: "Pausado", className: "bg-white/5 text-white/40 border-white/10" },
};

export default async function ServicesPage() {
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

  if (!company) redirect("/client/dashboard");

  const { data: services } = await supabase
    .from("company_services")
    .select("id, service_name, service_status, service_description")
    .eq("company_id", company.id)
    .order("created_at");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Meus Serviços</h1>
        <p className="text-white/50 mt-1">
          Acompanhe o status de cada serviço contratado com a Viccari Ads.
        </p>
      </div>

      {!services || services.length === 0 ? (
        <div className="bg-[#111111] border border-white/10 rounded-xl p-16 text-center">
          <Layers className="w-12 h-12 mx-auto mb-4 text-white/15" />
          <p className="text-white/30 text-sm">
            Seus serviços contratados aparecerão aqui quando configurados pela equipe.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {services.map((svc) => {
            const Icon = SERVICE_ICONS[svc.service_name] ?? Layers;
            const cfg = STATUS_CONFIG[svc.service_status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pausado;

            return (
              <div
                key={svc.id}
                className="bg-[#111111] border border-white/10 rounded-xl p-6 hover:border-[#771FE3]/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-[#771FE3]/20 to-[#8F68C1]/10">
                    <Icon className="w-5 h-5 text-[#8F68C1]" />
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${cfg.className}`}>
                    {cfg.label}
                  </span>
                </div>

                <p className="text-white font-semibold text-base mb-1.5">
                  {svc.service_name}
                </p>

                {svc.service_description ? (
                  <p className="text-white/40 text-sm leading-relaxed">
                    {svc.service_description}
                  </p>
                ) : (
                  <p className="text-white/20 text-sm italic">Sem descrição</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
