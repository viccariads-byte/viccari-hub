"use client";

import { useState, useTransition } from "react";
import { Loader2, Copy, Check, RefreshCw, Globe } from "lucide-react";
import { generateLpBrief, type LpBriefData } from "@/lib/actions/lp-brief";
import { toast } from "sonner";

interface Section {
  key: keyof LpBriefData;
  label: string;
  type?: "array";
}

const SECTIONS: Section[] = [
  { key: "headline", label: "Headline Principal" },
  { key: "sub_headline", label: "Sub-headline" },
  { key: "hero_section", label: "Seção Hero" },
  { key: "pain_points", label: "Dores Abordadas" },
  { key: "solution_section", label: "Apresentação da Solução" },
  { key: "differentials", label: "Diferenciais", type: "array" },
  { key: "social_proof", label: "Prova Social" },
  { key: "offer_and_cta", label: "Oferta e CTA" },
  { key: "faq", label: "FAQ" },
  { key: "contact_footer", label: "Rodapé de Contato" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado!");
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-white/30 hover:text-white/70 transition-colors"
      title="Copiar"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export function LpBriefPanel({
  companyId,
  initialData,
}: {
  companyId: string;
  initialData: LpBriefData | null;
}) {
  const [data, setData] = useState<LpBriefData | null>(initialData);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    startTransition(async () => {
      const result = await generateLpBrief(companyId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setData(result.data);
      toast.success("Briefing de LP gerado com sucesso!");
    });
  }

  return (
    <div className="bg-[#111111] border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#8F68C1]" />
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Briefing de LP
          </h2>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isPending}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#771FE3]/20 border border-[#771FE3]/30 text-[#8F68C1] hover:bg-[#771FE3]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
          {data ? "Regenerar" : "Gerar Briefing de LP"}
        </button>
      </div>

      {isPending && (
        <div className="flex items-center gap-3 text-white/40 text-sm py-6">
          <Loader2 className="w-4 h-4 animate-spin text-[#771FE3]" />
          Gerando estrutura da Landing Page via IA...
        </div>
      )}

      {!isPending && !data && (
        <p className="text-white/30 text-sm py-4">
          Clique em &quot;Gerar Briefing de LP&quot; para criar a estrutura completa da Landing Page baseada no Brand Brain e briefing do cliente.
        </p>
      )}

      {!isPending && data && (
        <div className="space-y-4">
          {SECTIONS.map(({ key, label, type }) => {
            const value = data[key];
            if (!value) return null;

            return (
              <div
                key={key}
                className="bg-black/30 rounded-lg p-4 border border-white/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-[#8F68C1] uppercase tracking-wider">
                    {label}
                  </p>
                  {type !== "array" && (
                    <CopyButton text={value as string} />
                  )}
                </div>

                {type === "array" ? (
                  <ul className="space-y-1.5">
                    {(value as string[]).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                        <span className="text-[#771FE3] font-mono mt-0.5">{i + 1}.</span>
                        <span className="flex-1">{item}</span>
                        <CopyButton text={item} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                    {value as string}
                  </p>
                )}
              </div>
            );
          })}

          <p className="text-white/20 text-xs pt-2">
            Gerado em {new Date(data.updated_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
      )}
    </div>
  );
}
