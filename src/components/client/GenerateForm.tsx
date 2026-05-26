"use client";

import { useState } from "react";
import { Sparkles, Video, LayoutGrid, ImageIcon, CheckCircle2, ArrowRight } from "lucide-react";
import { ContentFormat, GeneratedContent } from "@/lib/types/database";
import { generateSingleContent, PILLARS } from "@/lib/actions/content";
import { toast } from "sonner";
import Link from "next/link";

const FORMATS: { value: ContentFormat; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "reels", label: "Reels", icon: Video, desc: "Roteiro completo com cenas e fala" },
  { value: "feed", label: "Carrossel", icon: LayoutGrid, desc: "Slides com texto e estrutura" },
  { value: "stories", label: "Stories", icon: ImageIcon, desc: "Sequência de 4 a 6 stories" },
];

interface GenerateFormProps {
  companyId: string;
}

export function GenerateForm({ companyId }: GenerateFormProps) {
  const [format, setFormat] = useState<ContentFormat>("reels");
  const [pillar, setPillar] = useState(PILLARS[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setResult(null);
    try {
      const res = await generateSingleContent(companyId, format, pillar);
      if (res.error) {
        toast.error(res.error);
      } else if (res.data) {
        setResult(res.data);
        toast.success("Conteúdo gerado e salvo!");
      }
    } catch {
      toast.error("Erro ao gerar conteúdo.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
  }

  if (result) {
    return <ContentResult content={result} onReset={handleReset} />;
  }

  return (
    <div className="max-w-lg">
      {/* Format selector */}
      <div className="mb-6">
        <p className="text-sm font-medium text-white/60 mb-3">Formato</p>
        <div className="grid grid-cols-3 gap-3">
          {FORMATS.map(({ value, label, icon: Icon, desc }) => (
            <button
              key={value}
              onClick={() => setFormat(value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${
                format === value
                  ? "bg-[#771FE3]/15 border-[#771FE3]/40 text-white"
                  : "bg-[#111111] border-white/10 text-white/50 hover:text-white hover:border-white/20"
              }`}
            >
              <Icon className={`w-5 h-5 ${format === value ? "text-[#8F68C1]" : ""}`} />
              <span className="text-sm font-medium">{label}</span>
              <span className="text-xs text-white/30 leading-tight">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pillar selector */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-white/60 mb-2">
          Pilar estratégico
        </label>
        <select
          value={pillar}
          onChange={(e) => setPillar(e.target.value)}
          className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#771FE3]/50"
        >
          {PILLARS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#771FE3] to-[#8F68C1] hover:opacity-90 text-white font-semibold rounded-xl transition-opacity disabled:opacity-60"
      >
        <Sparkles className={`w-5 h-5 ${loading ? "animate-pulse" : ""}`} />
        {loading ? "Gerando conteúdo..." : "Gerar Conteúdo"}
      </button>

      {loading && (
        <p className="text-center text-white/30 text-xs mt-3">
          A IA está criando seu roteiro. Isso pode levar alguns segundos.
        </p>
      )}
    </div>
  );
}

const FORMAT_LABELS: Record<ContentFormat, string> = {
  reels: "Reels",
  feed: "Carrossel",
  stories: "Stories",
};

const SECTION_LABELS: Record<string, string> = {
  hook: "Hook de abertura",
  structure: "Estrutura",
  script: "Roteiro / Texto",
  caption: "Legenda",
  cta: "Call to Action",
};

function ContentResult({
  content,
  onReset,
}: {
  content: GeneratedContent;
  onReset: () => void;
}) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="text-sm text-green-400 font-medium">Conteúdo gerado e salvo</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#771FE3]/15 text-[#8F68C1] border border-[#771FE3]/20">
            {FORMAT_LABELS[content.format]}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
            {content.pillar}
          </span>
        </div>
      </div>

      {/* Title */}
      {content.title && (
        <h2 className="text-xl font-bold text-white mb-5">{content.title}</h2>
      )}

      {/* Content sections */}
      <div className="space-y-4 mb-6">
        {(["hook", "structure", "script", "caption", "cta"] as const).map((field) => {
          const value = content[field];
          if (!value) return null;
          return (
            <div key={field} className="bg-[#111111] border border-white/10 rounded-xl p-4">
              <p className="text-xs font-semibold text-[#8F68C1] uppercase tracking-wider mb-2">
                {SECTION_LABELS[field]}
              </p>
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">{value}</p>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="flex-1 py-2.5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 rounded-xl text-sm font-medium transition-colors"
        >
          Gerar outro
        </button>
        <Link
          href="/client/calendar"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#111111] border border-[#771FE3]/30 text-[#8F68C1] hover:bg-[#771FE3]/10 rounded-xl text-sm font-medium transition-colors"
        >
          Ver no calendário
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
