"use client";

import { useState, useTransition } from "react";
import { Globe, Bot, CheckCircle2, Clock, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { toggleModule, type ModuleType } from "@/lib/actions/modules";
import { toast } from "sonner";

type SubmissionData = {
  module_type: string;
  status: string;
  current_step: number;
  submitted_at: string | null;
  form_data: Record<string, unknown>;
};

interface ModulesManagerProps {
  companyId: string;
  modulesEnabled: Record<string, boolean>;
  submissions: SubmissionData[];
}

const MODULE_CONFIG = [
  {
    key: "site_briefing" as ModuleType,
    label: "Briefing de Site",
    description: "Coleta informações para criação do site institucional",
    icon: Globe,
    totalSteps: 5,
  },
  {
    key: "chatbot_briefing" as ModuleType,
    label: "Briefing de Chatbot",
    description: "Configura a identidade e regras do assistente virtual",
    icon: Bot,
    totalSteps: 6,
  },
];

const BRIEFING_SITE_SECTIONS = [
  { title: "Responsável", fields: [{ key: "clientName", label: "Nome" }, { key: "clientEmail", label: "E-mail" }] },
  { title: "Negócio", fields: [{ key: "bizName", label: "Empresa" }, { key: "bizSeg", label: "Segmento" }, { key: "bizCity", label: "Cidade" }, { key: "bizWpp", label: "WhatsApp" }, { key: "bizEmail", label: "E-mail comercial" }, { key: "bizSlogan", label: "Slogan" }, { key: "bizAbout", label: "Sobre" }] },
  { title: "Identidade Visual", fields: [{ key: "c1", label: "Cor principal", isColor: true }, { key: "c2", label: "Cor de destaque", isColor: true }, { key: "estiloVisual", label: "Estilo visual", array: true }, { key: "tomVoz", label: "Tom de voz", array: true }, { key: "logotipo", label: "Logotipo", array: true }, { key: "referencias", label: "Referências" }] },
  { title: "Serviços", fields: [{ key: "services", label: "Serviços", custom: "services" }] },
  { title: "Estrutura", fields: [{ key: "paginasDesejadas", label: "Páginas", array: true }, { key: "secoes", label: "Seções", array: true }, { key: "ctaPrincipal", label: "CTA principal" }] },
];

const BRIEFING_CHATBOT_SECTIONS = [
  { title: "Empresa", fields: [{ key: "clientName", label: "Responsável" }, { key: "clientEmail", label: "E-mail" }, { key: "clientWpp", label: "WhatsApp" }, { key: "bizName", label: "Empresa" }, { key: "bizSeg", label: "Segmento" }, { key: "bizCity", label: "Cidade" }, { key: "bizRegioes", label: "Regiões" }, { key: "bizAbout", label: "Sobre" }] },
  { title: "Identidade do Bot", fields: [{ key: "nomeBot", label: "Nome do bot" }, { key: "generoBot", label: "Gênero", array: true }, { key: "tomVoz", label: "Tom de voz", array: true }, { key: "revelarIA", label: "Revelar IA", array: true }, { key: "objetivoBot", label: "Objetivo" }, { key: "sucessoBot", label: "Sucesso" }, { key: "publicoAlvo", label: "Público-alvo" }] },
  { title: "Produtos", fields: [{ key: "produtos", label: "Produtos", custom: "products" }, { key: "priorizacao", label: "Priorização" }, { key: "naoOferecer", label: "Não oferecer" }, { key: "temCatalogo", label: "Catálogo", array: true }, { key: "linksMaterial", label: "Links" }, { key: "faq", label: "FAQ" }, { key: "objecoes", label: "Objeções" }] },
  { title: "Comercial", fields: [{ key: "informaPreco", label: "Informa preço", array: true }, { key: "condicoesPgto", label: "Condições de pagamento" }, { key: "politicaDesconto", label: "Política de desconto" }, { key: "frete", label: "Frete" }, { key: "perfisEspeciais", label: "Perfis especiais" }] },
  { title: "Regras", fields: [{ key: "gatilhosTransferencia", label: "Gatilhos de transferência" }, { key: "especialista", label: "Especialista" }, { key: "restricoes", label: "Restrições" }, { key: "infoInterna", label: "Info interna" }] },
  { title: "Integração", fields: [{ key: "canais", label: "Canais", array: true }, { key: "integracaoWA", label: "WhatsApp API", array: true }, { key: "usaGHL", label: "GoHighLevel", array: true }, { key: "pipeline", label: "Pipeline" }, { key: "horario", label: "Horário" }, { key: "foraHorario", label: "Fora do horário" }, { key: "exemplosReais", label: "Exemplos" }, { key: "infoExtra", label: "Info extra" }] },
];

function BriefingDataViewer({ data, sections }: { data: Record<string, unknown>; sections: typeof BRIEFING_SITE_SECTIONS }) {
  const filledSections = sections.filter((s) =>
    s.fields.some((f) => {
      const v = data[f.key];
      if ("array" in f && f.array) return (v as string[] | undefined)?.length;
      if ("custom" in f) return Array.isArray(v) && (v as unknown[]).length > 0;
      return !!v;
    })
  );
  if (filledSections.length === 0) return <p className="text-white/30 text-sm py-2">Nenhum dado preenchido ainda.</p>;

  return (
    <div className="space-y-5 mt-4">
      {filledSections.map((section) => (
        <div key={section.title}>
          <p className="text-xs font-semibold text-[#8F68C1] uppercase tracking-wider mb-2">{section.title}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            {section.fields.map((f) => {
              const v = data[f.key];
              if (!v) return null;

              if ("isColor" in f && f.isColor) {
                return (
                  <div key={f.key} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: v as string }} />
                    <div>
                      <p className="text-xs text-white/30">{f.label}</p>
                      <p className="text-sm text-white font-mono">{v as string}</p>
                    </div>
                  </div>
                );
              }

              if ("array" in f && f.array) {
                const arr = v as string[];
                if (!arr.length) return null;
                return (
                  <div key={f.key} className="md:col-span-2">
                    <p className="text-xs text-white/30 mb-1">{f.label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {arr.map((item, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-[#771FE3]/10 text-[#8F68C1] border border-[#771FE3]/20">{item}</span>
                      ))}
                    </div>
                  </div>
                );
              }

              if ("custom" in f && f.custom === "services") {
                const svcs = v as { nome: string; descricao: string; destaque: boolean }[];
                if (!Array.isArray(svcs) || !svcs.length) return null;
                return (
                  <div key={f.key} className="md:col-span-2 space-y-2">
                    <p className="text-xs text-white/30">{f.label}</p>
                    {svcs.map((svc, i) => (
                      <div key={i} className="bg-black/20 rounded-lg p-3">
                        <p className="text-sm text-white font-medium">{svc.nome} {svc.destaque && <span className="text-xs text-[#8F68C1] ml-1">★ Destaque</span>}</p>
                        {svc.descricao && <p className="text-xs text-white/40 mt-1">{svc.descricao}</p>}
                      </div>
                    ))}
                  </div>
                );
              }

              if ("custom" in f && f.custom === "products") {
                const prods = v as { nome: string; descricao: string }[];
                if (!Array.isArray(prods) || !prods.length) return null;
                return (
                  <div key={f.key} className="md:col-span-2 space-y-2">
                    <p className="text-xs text-white/30">{f.label}</p>
                    {prods.map((pr, i) => (
                      <div key={i} className="bg-black/20 rounded-lg p-3">
                        <p className="text-sm text-white font-medium">{pr.nome}</p>
                        {pr.descricao && <p className="text-xs text-white/40 mt-1">{pr.descricao}</p>}
                      </div>
                    ))}
                  </div>
                );
              }

              return (
                <div key={f.key}>
                  <p className="text-xs text-white/30">{f.label}</p>
                  <p className="text-sm text-white leading-relaxed">{v as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ModulesManager({ companyId, modulesEnabled, submissions }: ModulesManagerProps) {
  const [enabled, setEnabled] = useState(modulesEnabled);
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  function handleToggle(moduleType: ModuleType, value: boolean) {
    startTransition(async () => {
      const result = await toggleModule(companyId, moduleType, value);
      if (result.error) { toast.error(result.error); return; }
      setEnabled((prev) => ({ ...prev, [moduleType]: value }));
      toast.success(value ? "Módulo ativado." : "Módulo desativado.");
    });
  }

  return (
    <div className="bg-[#111111] border border-white/10 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Módulos</h2>
      </div>

      <div className="space-y-4">
        {MODULE_CONFIG.map(({ key, label, description, icon: Icon, totalSteps }) => {
          const isEnabled = enabled[key] ?? false;
          const submission = submissions.find((s) => s.module_type === key);
          const status = submission?.status;
          const currentStep = submission?.current_step ?? 0;
          const isExpanded = expanded[key] ?? false;
          const formData = (submission?.form_data ?? {}) as Record<string, unknown>;
          const sections = key === "site_briefing" ? BRIEFING_SITE_SECTIONS : BRIEFING_CHATBOT_SECTIONS;

          return (
            <div
              key={key}
              className={`border rounded-xl p-5 transition-all ${isEnabled ? "border-[#771FE3]/30 bg-[#771FE3]/5" : "border-white/10"}`}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg ${isEnabled ? "bg-[#771FE3]/20" : "bg-white/5"}`}>
                    <Icon className={`w-4 h-4 ${isEnabled ? "text-[#8F68C1]" : "text-white/30"}`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`font-semibold text-sm ${isEnabled ? "text-white" : "text-white/40"}`}>{label}</p>
                    <p className="text-xs text-white/30 truncate">{description}</p>
                  </div>
                </div>

                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggle(key, !isEnabled)}
                  disabled={isPending}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 transition-colors duration-200 focus:outline-none ${isEnabled ? "bg-[#771FE3] border-[#771FE3]" : "bg-white/10 border-white/10"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 mt-0.5 ${isEnabled ? "translate-x-5" : "translate-x-0.5"}`}
                  />
                </button>
              </div>

              {/* Status + progress */}
              {isEnabled && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {status === "concluido" ? (
                        <><CheckCircle2 className="w-3.5 h-3.5 text-green-400" /><span className="text-xs text-green-400 font-medium">Concluído</span></>
                      ) : status === "em_andamento" ? (
                        <><Clock className="w-3.5 h-3.5 text-[#8F68C1]" /><span className="text-xs text-[#8F68C1] font-medium">Em andamento — etapa {currentStep}/{totalSteps}</span></>
                      ) : (
                        <><Circle className="w-3.5 h-3.5 text-white/20" /><span className="text-xs text-white/30">Não iniciado</span></>
                      )}
                    </div>
                    {submission && (
                      <button
                        type="button"
                        onClick={() => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))}
                        className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {isExpanded ? "Ocultar dados" : "Ver dados"}
                      </button>
                    )}
                  </div>

                  {status !== "concluido" && (
                    <div className="h-1.5 bg-white/10 rounded-full">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-[#771FE3] to-[#8F68C1] transition-all"
                        style={{ width: `${submission ? (currentStep / totalSteps) * 100 : 0}%` }}
                      />
                    </div>
                  )}

                  {isExpanded && submission && (
                    <BriefingDataViewer data={formData} sections={sections} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
