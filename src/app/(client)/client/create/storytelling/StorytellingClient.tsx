"use client";

import { useState } from "react";
import { Loader2, Copy, Check, ChevronDown, ChevronRight, PenLine } from "lucide-react";
import { generateStorytelling, type StorytellingRoteiro } from "@/lib/actions/storytelling";
import { toast } from "sonner";

const PLATFORMS = ["Instagram Reels", "TikTok", "YouTube Shorts", "Stories"];
const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const QUANTITIES = [1, 3, 5, 10];

const PILAR_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  dor: { bg: "bg-red-950/60", text: "text-red-300", label: "Dor" },
  autoridade: { bg: "bg-purple-950/60", text: "text-purple-300", label: "Autoridade" },
  prova_social: { bg: "bg-green-950/60", text: "text-green-300", label: "Prova Social" },
  bastidor: { bg: "bg-pink-950/60", text: "text-pink-300", label: "Bastidor" },
  conexao: { bg: "bg-amber-950/60", text: "text-amber-300", label: "Conexão" },
};

function MultiSelect({
  options,
  selected,
  onChange,
  placeholder,
}: {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  function toggle(opt: string) {
    onChange(
      selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 border ${
              active
                ? "bg-[#771FE3]/20 border-[#771FE3]/50 text-white"
                : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20"
            }`}
          >
            {opt}
          </button>
        );
      })}
      {selected.length === 0 && (
        <span className="text-white/30 text-sm self-center">{placeholder}</span>
      )}
    </div>
  );
}

function AccordionSection({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="border-t border-white/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-white/70 hover:text-white transition-colors"
      >
        {title}
        {open ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function RoteiroCard({ roteiro }: { roteiro: StorytellingRoteiro }) {
  const [copied, setCopied] = useState(false);
  const pilar = PILAR_STYLES[roteiro.pilar] ?? PILAR_STYLES.conexao;

  function buildFullText() {
    const dev = roteiro.desenvolvimento
      .map((d) => `[${d.tempo}] ${d.tag}: ${d.script}${d.nota ? ` (${d.nota})` : ""}`)
      .join("\n");

    return `ROTEIRO ${roteiro.numero} — ${roteiro.titulo}
Pilar: ${pilar.label} | Plataforma: ${roteiro.plataforma} | Tempo: ${roteiro.tempo_estimado}

HOOK [${roteiro.hook.tempo}]
${roteiro.hook.script}

DESENVOLVIMENTO
${dev}

VIRADA [${roteiro.virada.tempo}]
${roteiro.virada.script}

CTA [${roteiro.cta.tempo}]
${roteiro.cta.script}

CAIXINHA: ${roteiro.caixinha_pergunta}

DICAS DE PRODUÇÃO
${roteiro.dicas_producao.map((d, i) => `${i + 1}. ${d}`).join("\n")}`;
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(buildFullText());
    setCopied(true);
    toast.success("Roteiro copiado!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white/40 text-sm font-mono">#{roteiro.numero}</span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pilar.bg} ${pilar.text}`}
          >
            {pilar.label}
          </span>
          <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
            {roteiro.plataforma}
          </span>
          <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
            {roteiro.tempo_estimado}
          </span>
        </div>
      </div>

      <div className="px-4 pb-2">
        <h3 className="text-white font-semibold">{roteiro.titulo}</h3>
      </div>

      {/* Hook — aberto por padrão */}
      <AccordionSection title={`Hook [${roteiro.hook.tempo}]`} defaultOpen>
        <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
          {roteiro.hook.script}
        </p>
      </AccordionSection>

      <AccordionSection title="Desenvolvimento">
        <div className="space-y-3">
          {roteiro.desenvolvimento.map((d, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#771FE3] text-xs font-mono">{d.tempo}</span>
                <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                  {d.tag}
                </span>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">{d.script}</p>
              {d.nota && (
                <p className="text-white/40 text-xs mt-1 italic">{d.nota}</p>
              )}
            </div>
          ))}
        </div>
      </AccordionSection>

      <AccordionSection title={`Virada [${roteiro.virada.tempo}]`}>
        <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
          {roteiro.virada.script}
        </p>
      </AccordionSection>

      <AccordionSection title={`CTA [${roteiro.cta.tempo}]`}>
        <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
          {roteiro.cta.script}
        </p>
      </AccordionSection>

      <AccordionSection title="Caixinha de Pergunta">
        <p className="text-white/80 text-sm">{roteiro.caixinha_pergunta}</p>
      </AccordionSection>

      <AccordionSection title="Dicas de Produção">
        <ul className="space-y-1">
          {roteiro.dicas_producao.map((d, i) => (
            <li key={i} className="flex gap-2 text-sm text-white/70">
              <span className="text-[#771FE3] font-mono">{i + 1}.</span>
              {d}
            </li>
          ))}
        </ul>
      </AccordionSection>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {copied ? "Copiado!" : "Copiar roteiro completo"}
        </button>
      </div>
    </div>
  );
}

export function StorytellingClient({ companyId }: { companyId: string }) {
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(3);
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [additionalTone, setAdditionalTone] = useState("");
  const [loading, setLoading] = useState(false);
  const [roteiros, setRoteiros] = useState<StorytellingRoteiro[]>([]);

  async function handleGenerate() {
    if (platforms.length === 0) {
      toast.error("Selecione ao menos uma plataforma.");
      return;
    }
    setLoading(true);
    setRoteiros([]);

    const result = await generateStorytelling({
      companyId,
      platforms,
      quantity,
      preferredDays,
      additionalTone,
    });

    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setRoteiros(result.data.roteiros);
    toast.success(`${result.data.roteiros.length} roteiros gerados com sucesso!`);
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#771FE3] to-[#8F68C1]">
            <PenLine className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Criar Roteiros</h1>
        </div>
        <p className="text-white/50 ml-12">
          Configure e gere roteiros personalizados para sua marca
        </p>
      </div>

      {/* Config card */}
      <div className="bg-[#111111] border border-white/10 rounded-xl p-6 mb-6 space-y-6">
        {/* Quantidade */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-3">
            Quantidade de roteiros
          </label>
          <div className="flex gap-2">
            {QUANTITIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuantity(q)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
                  quantity === q
                    ? "bg-[#771FE3]/20 border-[#771FE3]/50 text-white"
                    : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20"
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Plataformas */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-3">
            Plataformas
          </label>
          <MultiSelect
            options={PLATFORMS}
            selected={platforms}
            onChange={setPlatforms}
            placeholder="Selecione as plataformas"
          />
        </div>

        {/* Dias da semana */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-3">
            Dias da semana <span className="text-white/30 font-normal">(opcional)</span>
          </label>
          <MultiSelect
            options={DAYS}
            selected={preferredDays}
            onChange={setPreferredDays}
            placeholder="Selecione os dias preferidos"
          />
        </div>

        {/* Instrução adicional */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Instrução adicional{" "}
            <span className="text-white/30 font-normal">(opcional)</span>
          </label>
          <textarea
            value={additionalTone}
            onChange={(e) => setAdditionalTone(e.target.value)}
            rows={3}
            placeholder="Ex: foco em datas comemorativas, tom mais descontraído..."
            className="w-full bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-[#771FE3]/50"
          />
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="w-full h-11 flex items-center justify-center gap-2 bg-gradient-to-r from-[#771FE3] to-[#8F68C1] hover:from-[#6a1bcc] hover:to-[#7d5aad] text-white font-semibold text-sm rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Gerando roteiros...
            </>
          ) : (
            "Gerar Roteiros"
          )}
        </button>
      </div>

      {/* Roteiros gerados */}
      {roteiros.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">
            {roteiros.length} roteiro{roteiros.length > 1 ? "s" : ""} gerado
            {roteiros.length > 1 ? "s" : ""}
          </h2>
          {roteiros.map((r) => (
            <RoteiroCard key={r.numero} roteiro={r} />
          ))}
        </div>
      )}
    </div>
  );
}
