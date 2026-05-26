"use client";

import { useState } from "react";
import {
  Brain,
  RefreshCw,
  Mic,
  Globe,
  Smile,
  Zap,
  BookOpen,
  AlertTriangle,
  Target,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { BrandBrain } from "@/lib/types/database";
import { generateBrandBrain } from "@/lib/actions/brand-brain";
import { toast } from "sonner";

interface BrandBrainPanelProps {
  companyId: string;
  brandBrain: BrandBrain | null;
}

const fields = [
  { key: "tone_of_voice", label: "Tom de Voz", icon: Mic },
  { key: "language", label: "Linguagem e Vocabulário", icon: Globe },
  { key: "archetype", label: "Arquétipo de Marca", icon: Smile },
  { key: "dominant_emotion", label: "Emoção Dominante", icon: Zap },
  { key: "cta_style", label: "Estilo de CTA", icon: MessageSquare },
  { key: "content_structure", label: "Estrutura de Conteúdo", icon: BookOpen },
  { key: "communication_rules", label: "Regras de Comunicação", icon: Target },
  { key: "forbidden_words", label: "Palavras Proibidas", icon: AlertTriangle },
] as const;

export function BrandBrainPanel({ companyId, brandBrain }: BrandBrainPanelProps) {
  const [loading, setLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const result = await generateBrandBrain(companyId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Brand Brain gerado com sucesso!");
        // Full page refresh to get new data
        window.location.reload();
      }
    } catch {
      toast.error("Erro ao gerar Brand Brain.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#111111] border border-white/10 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-[#8F68C1]" />
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Brand Brain
          </h2>
          {brandBrain && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#771FE3]/15 text-[#8F68C1] border border-[#771FE3]/20">
              Gerado
            </span>
          )}
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-[#771FE3]/15 text-[#8F68C1] border border-[#771FE3]/20 hover:bg-[#771FE3]/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Gerando..." : brandBrain ? "Regenerar" : "Gerar Brand Brain"}
        </button>
      </div>

      {!brandBrain ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
            <Brain className="w-6 h-6 text-white/20" />
          </div>
          <p className="text-white/30 text-sm">
            O Brand Brain ainda não foi gerado.
          </p>
          <p className="text-white/20 text-xs mt-1">
            Certifique-se de que o briefing foi preenchido antes de gerar.
          </p>
        </div>
      ) : (
        <>
          {/* Fields grid */}
          <div className="grid grid-cols-1 gap-3 mb-4">
            {fields.map(({ key, label, icon: Icon }) => {
              const value = brandBrain[key as keyof BrandBrain];
              if (!value) return null;
              return (
                <div key={key} className="flex gap-3 py-2 border-b border-white/5 last:border-0">
                  <Icon className="w-4 h-4 text-[#771FE3] flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-white/40 mb-0.5">{label}</p>
                    <p className="text-sm text-white leading-relaxed">{value as string}</p>
                  </div>
                </div>
              );
            })}

            {/* Strategic Pillars */}
            {brandBrain.strategic_pillars && brandBrain.strategic_pillars.length > 0 && (
              <div className="flex gap-3 py-2">
                <Target className="w-4 h-4 text-[#771FE3] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-white/40 mb-1.5">Pilares Estratégicos</p>
                  <div className="flex flex-wrap gap-1.5">
                    {brandBrain.strategic_pillars.map((pillar, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-full bg-[#771FE3]/10 text-[#8F68C1] border border-[#771FE3]/20"
                      >
                        {pillar}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Raw JSON toggle */}
          {brandBrain.raw_output && (
            <div>
              <button
                onClick={() => setShowRaw((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/50 transition-colors"
              >
                {showRaw ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {showRaw ? "Ocultar JSON raw" : "Ver JSON raw"}
              </button>
              {showRaw && (
                <pre className="mt-3 p-4 bg-black/30 rounded-lg text-xs text-white/50 overflow-x-auto font-mono leading-relaxed">
                  {JSON.stringify(JSON.parse(brandBrain.raw_output), null, 2)}
                </pre>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
