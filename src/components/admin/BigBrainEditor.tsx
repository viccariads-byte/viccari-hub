"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Brain, Save, Loader2, ChevronRight, Hash, Lightbulb } from "lucide-react";
import { saveBigBrain } from "@/lib/actions/big-brain";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Subniche {
  id: string;
  name: string;
  niche_id: string;
}

interface Niche {
  id: string;
  name: string;
  subniches: Subniche[];
}

interface BigBrainEntry {
  niche_id: string;
  subniche_id: string | null;
  content: string;
  updated_at: string;
}

interface Props {
  niches: Niche[];
  bigBrainRecord: Record<string, BigBrainEntry>;
}

const TEMPLATE = `# Tom de voz e linguagem
[Descreva o estilo de comunicação típico do nicho]

# Principais dores do público
[Liste as principais dores e frustrações do público deste nicho]

# Desejos e motivações
[O que o público deste nicho mais deseja conquistar?]

# Gatilhos emocionais que funcionam
[Quais emoções/gatilhos movem o público a agir?]

# Objeções comuns
[Quais são as principais resistências de compra deste nicho?]

# Formatos de conteúdo que performam
[Reels curtos? Carrosséis educativos? Stories de bastidores?]

# Sazonalidades e datas importantes
[Datas comemorativas, eventos do setor, picos de demanda]

# Palavras e expressões que convertem
[Vocabulário típico, termos técnicos do nicho, gatilhos verbais]

# Exemplos de hooks que funcionam
[3-5 hooks de abertura validados para este nicho]`;

function getBrainKey(nicheId: string, subnicheId: string | null) {
  return subnicheId ? `${nicheId}__${subnicheId}` : nicheId;
}

export function BigBrainEditor({ niches, bigBrainRecord }: Props) {
  const [selectedNiche, setSelectedNiche] = useState<string | null>(
    niches[0]?.id ?? null
  );
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [content, setContent] = useState<string>(() => {
    if (!niches[0]) return "";
    const entry = bigBrainRecord[niches[0].id];
    return entry?.content ?? "";
  });
  const [isPending, startTransition] = useTransition();

  function handleSelectNiche(nicheId: string) {
    setSelectedNiche(nicheId);
    setSelectedSub(null);
    const entry = bigBrainRecord[nicheId];
    setContent(entry?.content ?? "");
  }

  function handleSelectSub(nicheId: string, subId: string) {
    setSelectedNiche(nicheId);
    setSelectedSub(subId);
    const key = getBrainKey(nicheId, subId);
    const entry = bigBrainRecord[key];
    setContent(entry?.content ?? "");
  }

  function handleSave() {
    if (!selectedNiche) return;
    startTransition(async () => {
      const result = await saveBigBrain({
        niche_id: selectedNiche,
        subniche_id: selectedSub,
        content,
      });
      if (result?.error) toast.error(result.error);
      else toast.success("Big Brain salvo com sucesso!");
    });
  }

  // Find current selection labels
  const currentNiche = niches.find((n) => n.id === selectedNiche);
  const currentSub = currentNiche?.subniches.find((s) => s.id === selectedSub);
  const currentKey = getBrainKey(selectedNiche ?? "", selectedSub);
  const existingEntry = bigBrainRecord[currentKey];

  return (
    <div className="flex gap-4 h-[calc(100vh-12rem)]">
      {/* Left panel: niche tree */}
      <aside className="w-64 flex-shrink-0 bg-[#111111] border border-white/10 rounded-xl overflow-y-auto">
        <div className="p-3 border-b border-white/10">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider px-1">
            Selecionar nicho
          </p>
        </div>
        <nav className="p-2 space-y-0.5">
          {niches.map((niche) => {
            const isNicheSelected = selectedNiche === niche.id && !selectedSub;
            const hasBrain = niche.id in bigBrainRecord;
            return (
              <div key={niche.id}>
                <button
                  onClick={() => handleSelectNiche(niche.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-left transition-all ${
                    isNicheSelected
                      ? "bg-gradient-to-r from-[#771FE3]/20 to-[#8F68C1]/10 text-white border border-[#771FE3]/30"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Brain
                    className={`w-3.5 h-3.5 flex-shrink-0 ${isNicheSelected ? "text-[#771FE3]" : "text-white/20"}`}
                  />
                  <span className="flex-1 truncate">{niche.name}</span>
                  {hasBrain && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#771FE3] flex-shrink-0" />
                  )}
                </button>

                {/* Subniches */}
                {niche.subniches.map((sub) => {
                  const isSubSelected = selectedSub === sub.id;
                  const subKey = getBrainKey(niche.id, sub.id);
                  const hasSubBrain = subKey in bigBrainRecord;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleSelectSub(niche.id, sub.id)}
                      className={`w-full flex items-center gap-2 pl-7 pr-2.5 py-1.5 rounded-lg text-xs text-left transition-all ${
                        isSubSelected
                          ? "bg-[#771FE3]/15 text-[#8F68C1] border border-[#771FE3]/20"
                          : "text-white/30 hover:text-white/60 hover:bg-white/5"
                      }`}
                    >
                      <Hash className="w-3 h-3 flex-shrink-0" />
                      <span className="flex-1 truncate">{sub.name}</span>
                      {hasSubBrain && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8F68C1] flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Right panel: editor */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {/* Toolbar */}
        <div className="bg-[#111111] border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-1.5 text-sm text-white font-medium">
              <span>{currentNiche?.name ?? "Nenhum nicho selecionado"}</span>
              {currentSub && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                  <span className="text-[#8F68C1]">{currentSub.name}</span>
                </>
              )}
            </div>
            {existingEntry && (
              <p className="text-xs text-white/30 mt-0.5">
                Atualizado em{" "}
                {new Date(existingEntry.updated_at).toLocaleString("pt-BR")}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-white/30">
              {content.length.toLocaleString("pt-BR")} caracteres
            </span>
            <Button
              onClick={handleSave}
              disabled={isPending || !selectedNiche}
              className="h-8 text-sm bg-gradient-to-r from-[#771FE3] to-[#8F68C1] hover:from-[#6a1bcc] hover:to-[#7d5aad] text-white border-0 px-3"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Template hint */}
        {!content && selectedNiche && (
          <div className="bg-[#771FE3]/8 border border-[#771FE3]/20 rounded-xl px-4 py-3 flex items-start gap-3 flex-shrink-0">
            <Lightbulb className="w-4 h-4 text-[#8F68C1] flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/60">
                Nenhum conteúdo ainda.{" "}
                <button
                  onClick={() => setContent(TEMPLATE)}
                  className="text-[#8F68C1] hover:text-[#771FE3] underline underline-offset-2 transition-colors"
                >
                  Usar template sugerido
                </button>{" "}
                ou escreva livremente abaixo.
              </p>
            </div>
          </div>
        )}

        {/* Textarea */}
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            selectedNiche
              ? "Escreva aqui o contexto estratégico deste nicho — linguagem, dores, gatilhos, objeções, formatos, sazonalidades e hooks validados..."
              : "Selecione um nicho ou subnicho para começar a editar."
          }
          disabled={!selectedNiche}
          className="flex-1 bg-[#111111] border-white/10 text-white placeholder:text-white/20 focus:border-[#771FE3] text-sm leading-relaxed resize-none font-mono"
        />
      </div>
    </div>
  );
}
