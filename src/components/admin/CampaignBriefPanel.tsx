"use client";

import { useState, useTransition } from "react";
import { Loader2, Copy, Check, RefreshCw, Megaphone } from "lucide-react";
import { generateCampaignBrief, type CampaignBriefData } from "@/lib/actions/campaign-brief";
import { toast } from "sonner";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado!");
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button type="button" onClick={handleCopy} className="text-white/30 hover:text-white/70 transition-colors" title="Copiar">
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-black/30 rounded-lg p-4 border border-white/5">
      <p className="text-xs font-semibold text-[#8F68C1] uppercase tracking-wider mb-3">{title}</p>
      {children}
    </div>
  );
}

function TextRow({ label, value }: { label?: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        {label && <p className="text-xs text-white/30 mb-0.5">{label}</p>}
        <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{value}</p>
      </div>
      <CopyButton text={value} />
    </div>
  );
}

export function CampaignBriefPanel({
  companyId,
  initialData,
}: {
  companyId: string;
  initialData: CampaignBriefData | null;
}) {
  const [data, setData] = useState<CampaignBriefData | null>(initialData);
  const [platform, setPlatform] = useState<"meta" | "google" | "both">(
    initialData?.platform ?? "meta"
  );
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    startTransition(async () => {
      const result = await generateCampaignBrief(companyId, platform);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setData(result.data);
      toast.success("Briefing de Campanha gerado com sucesso!");
    });
  }

  const PLATFORM_OPTIONS: { value: "meta" | "google" | "both"; label: string }[] = [
    { value: "meta", label: "Meta Ads" },
    { value: "google", label: "Google Ads" },
    { value: "both", label: "Meta + Google" },
  ];

  return (
    <div className="bg-[#111111] border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-[#8F68C1]" />
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Briefing de Campanha
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Platform selector */}
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            {PLATFORM_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPlatform(opt.value)}
                disabled={isPending}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  platform === opt.value
                    ? "bg-[#771FE3]/30 text-white"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isPending}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#771FE3]/20 border border-[#771FE3]/30 text-[#8F68C1] hover:bg-[#771FE3]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            {data ? "Regenerar" : "Gerar Briefing"}
          </button>
        </div>
      </div>

      {isPending && (
        <div className="flex items-center gap-3 text-white/40 text-sm py-6">
          <Loader2 className="w-4 h-4 animate-spin text-[#771FE3]" />
          Gerando copies e estratégia de campanha via IA...
        </div>
      )}

      {!isPending && !data && (
        <p className="text-white/30 text-sm py-4">
          Selecione a plataforma e clique em &quot;Gerar Briefing&quot; para criar copies, headlines e estratégia de funil personalizados.
        </p>
      )}

      {!isPending && data && (
        <div className="space-y-4">
          {/* Objetivo + Público */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard title="Objetivo da Campanha">
              <TextRow value={data.campaign_objective} />
            </SectionCard>
            <SectionCard title="Público para Segmentação">
              <TextRow value={data.target_audience} />
            </SectionCard>
          </div>

          {/* Meta Copies */}
          {data.meta_copies && (
            <SectionCard title="Copies — Meta Ads">
              <div className="space-y-3">
                <TextRow label="Primário" value={data.meta_copies.primary} />
                <div className="border-t border-white/5 pt-3">
                  <TextRow label="Secundário" value={data.meta_copies.secondary} />
                </div>
                <div className="border-t border-white/5 pt-3">
                  <TextRow label="Retargeting" value={data.meta_copies.retargeting} />
                </div>
              </div>
            </SectionCard>
          )}

          {/* Google Headlines */}
          {data.google_headlines && data.google_headlines.length > 0 && (
            <SectionCard title="Headlines — Google Ads (15 variações)">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {data.google_headlines.map((h, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 bg-white/5 rounded px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[#771FE3] text-xs font-mono flex-shrink-0">{i + 1}.</span>
                      <span className="text-sm text-white/80 truncate">{h}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`text-xs font-mono ${h.length > 30 ? "text-red-400" : "text-white/30"}`}>
                        {h.length}/30
                      </span>
                      <CopyButton text={h} />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Google Descriptions */}
          {data.google_descriptions && data.google_descriptions.length > 0 && (
            <SectionCard title="Descrições — Google Ads (4 variações)">
              <div className="space-y-2">
                {data.google_descriptions.map((d, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 bg-white/5 rounded px-3 py-2">
                    <div className="flex gap-2 flex-1 min-w-0">
                      <span className="text-[#771FE3] text-xs font-mono flex-shrink-0 mt-0.5">{i + 1}.</span>
                      <span className="text-sm text-white/80 leading-relaxed">{d}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`text-xs font-mono ${d.length > 90 ? "text-red-400" : "text-white/30"}`}>
                        {d.length}/90
                      </span>
                      <CopyButton text={d} />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* CTA + Funil */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard title="CTA por Objetivo">
              <TextRow value={data.cta_by_objective} />
            </SectionCard>
            <SectionCard title="Estratégia de Funil">
              <TextRow value={data.funnel_strategy} />
            </SectionCard>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-white/20 text-xs">
              Gerado em {new Date(data.updated_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
              {" · "}Plataforma: {data.platform === "both" ? "Meta + Google" : data.platform === "meta" ? "Meta Ads" : "Google Ads"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
