"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Target,
  Users,
  Tag,
  TrendingUp,
  MessageSquare,
  Shield,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  Brain,
  Zap,
  BookOpen,
} from "lucide-react";
import { generatePlaybook, type PlaybookContent } from "@/lib/actions/playbook";
import { toast } from "sonner";

const GUIDE_SECTIONS = [
  { key: "posicionamento", label: "Posicionamento", icon: Target },
  { key: "persona", label: "Persona & Público", icon: Users },
  { key: "oferta", label: "Oferta & Preços", icon: Tag },
  { key: "argumentacao", label: "Argumentação", icon: TrendingUp },
  { key: "scripts", label: "Scripts de Vendas", icon: MessageSquare },
  { key: "objecoes", label: "Tratamento de Objeções", icon: Shield },
] as const;

const QUICK_CARDS = [
  {
    key: "frase_posicionamento",
    label: "Frase de Posicionamento",
    hint: "Use em bio, cartão de visita e apresentações",
  },
  {
    key: "proposta_valor",
    label: "Proposta de Valor",
    hint: "O que você faz, para quem e por que importa",
  },
  {
    key: "principal_argumento",
    label: "Principal Argumento de Venda",
    hint: "Seu argumento mais poderoso",
  },
  {
    key: "cta_ideal",
    label: "CTA Ideal",
    hint: "A ação mais eficaz para converter clientes",
  },
  {
    key: "resposta_objecao",
    label: "Resposta à Objeção Principal",
    hint: "Resposta pronta para a objeção mais comum",
  },
] as const;

type GuideKey = (typeof GUIDE_SECTIONS)[number]["key"];
type QuickKey = (typeof QUICK_CARDS)[number]["key"];

interface PlaybookViewProps {
  companyId: string;
  playbook: PlaybookContent | null;
  hasBrandBrain: boolean;
}

function renderContent(text: string) {
  return text.split("\n").map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} className="h-3" />;

    if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      return (
        <div key={i} className="flex items-start gap-2 my-1">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#771FE3] flex-shrink-0" />
          <p className="text-white/80 leading-relaxed">{trimmed.slice(2)}</p>
        </div>
      );
    }

    if (
      trimmed.endsWith(":") &&
      trimmed.length < 70 &&
      !trimmed.includes(".")
    ) {
      return (
        <p key={i} className="text-[#8F68C1] font-semibold text-sm mt-4 mb-1">
          {trimmed}
        </p>
      );
    }

    return (
      <p key={i} className="text-white/80 leading-relaxed my-1">
        {trimmed}
      </p>
    );
  });
}

export function PlaybookView({ companyId, playbook, hasBrandBrain }: PlaybookViewProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"guia" | "consulta">("guia");
  const [activeSection, setActiveSection] = useState<GuideKey>("posicionamento");
  const [copied, setCopied] = useState<QuickKey | null>(null);
  const [isRegenerating, startRegenerate] = useTransition();

  async function handleCopy(key: QuickKey, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleRegenerate() {
    startRegenerate(async () => {
      const result = await generatePlaybook(companyId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Playbook atualizado com sucesso!");
      router.refresh();
    });
  }

  if (!hasBrandBrain) {
    return (
      <div className="bg-[#111111] border border-white/10 rounded-xl p-12 text-center">
        <Brain className="w-12 h-12 mx-auto mb-4 text-white/20" />
        <h2 className="text-lg font-semibold text-white mb-2">Brand Brain necessário</h2>
        <p className="text-white/40 text-sm max-w-sm mx-auto">
          O Playbook Comercial é gerado com base no Brand Brain da sua marca. Solicite ao seu gerente de conta que gere o Brand Brain primeiro.
        </p>
      </div>
    );
  }

  if (!playbook) {
    return (
      <div className="bg-[#111111] border border-white/10 rounded-xl p-12 text-center">
        <BookOpen className="w-12 h-12 mx-auto mb-4 text-white/20" />
        <h2 className="text-lg font-semibold text-white mb-2">Playbook ainda não gerado</h2>
        <p className="text-white/40 text-sm max-w-sm mx-auto mb-6">
          Seu Playbook Comercial será gerado em breve pela equipe Viccari. Volte em instantes.
        </p>
        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#771FE3] to-[#8F68C1] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {isRegenerating ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Gerando...</>
          ) : (
            <><Zap className="w-4 h-4" />Gerar Playbook</>
          )}
        </button>
      </div>
    );
  }

  const activeSectionData = GUIDE_SECTIONS.find((s) => s.key === activeSection);
  const activeSectionContent = playbook[activeSection];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Playbook Comercial</h1>
          <p className="text-white/50 mt-1 text-sm">
            Seu guia estratégico de vendas, gerado por IA com base no Brand Brain.
          </p>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-white/50 text-sm hover:border-[#771FE3]/40 hover:text-white/80 transition-all disabled:opacity-50"
        >
          {isRegenerating ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" />Gerando...</>
          ) : (
            <><RefreshCw className="w-3.5 h-3.5" />Regenerar</>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#111111] border border-white/10 rounded-xl mb-6 w-fit">
        <button
          onClick={() => setTab("guia")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "guia"
              ? "bg-gradient-to-r from-[#771FE3] to-[#8F68C1] text-white shadow"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Guia Completo
        </button>
        <button
          onClick={() => setTab("consulta")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "consulta"
              ? "bg-gradient-to-r from-[#771FE3] to-[#8F68C1] text-white shadow"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          <Zap className="w-4 h-4" />
          Consulta Rápida
        </button>
      </div>

      {/* Guia Completo */}
      {tab === "guia" && (
        <div className="flex gap-4">
          {/* Section sidebar */}
          <div className="w-52 flex-shrink-0">
            <div className="bg-[#111111] border border-white/10 rounded-xl p-2 space-y-1 sticky top-6">
              {GUIDE_SECTIONS.map(({ key, label, icon: Icon }) => {
                const isActive = activeSection === key;
                const hasContent = !!playbook[key];
                return (
                  <button
                    key={key}
                    onClick={() => setActiveSection(key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-[#771FE3]/20 to-[#8F68C1]/10 text-white border border-[#771FE3]/30"
                        : "text-white/40 hover:text-white/70 hover:bg-white/5"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[#771FE3]" : ""}`}
                    />
                    <span className="flex-1 truncate">{label}</span>
                    {hasContent && !isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#771FE3]/40 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section content */}
          <div className="flex-1 min-w-0">
            <div className="bg-[#111111] border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-white/10">
                {activeSectionData && (
                  <>
                    <div className="p-2 rounded-lg bg-[#771FE3]/15">
                      <activeSectionData.icon className="w-5 h-5 text-[#8F68C1]" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">
                      {activeSectionData.label}
                    </h2>
                  </>
                )}
              </div>

              {activeSectionContent ? (
                <div className="space-y-0.5">
                  {renderContent(activeSectionContent)}
                </div>
              ) : (
                <p className="text-white/30 text-sm">
                  Esta seção ainda não foi gerada.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Consulta Rápida */}
      {tab === "consulta" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {QUICK_CARDS.map(({ key, label, hint }) => {
            const text = playbook[key] ?? "";
            const isCopied = copied === key;
            return (
              <div
                key={key}
                className="bg-[#111111] border border-white/10 rounded-xl p-5 flex flex-col gap-3 hover:border-[#771FE3]/20 transition-colors"
              >
                <div>
                  <p className="text-xs font-semibold text-[#8F68C1] uppercase tracking-wider mb-0.5">
                    {label}
                  </p>
                  <p className="text-[11px] text-white/25">{hint}</p>
                </div>

                <p className="text-white/80 text-sm leading-relaxed flex-1">
                  {text || <span className="text-white/20 italic">Não gerado</span>}
                </p>

                {text && (
                  <button
                    onClick={() => handleCopy(key, text)}
                    className={`self-end flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      isCopied
                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                        : "bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:border-white/20"
                    }`}
                  >
                    {isCopied ? (
                      <><Check className="w-3 h-3" />Copiado!</>
                    ) : (
                      <><Copy className="w-3 h-3" />Copiar</>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
