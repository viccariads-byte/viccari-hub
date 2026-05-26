import { createClient } from "@/lib/supabase/server";
import { BigBrainEditor } from "@/components/admin/BigBrainEditor";
import { Brain } from "lucide-react";
import Link from "next/link";

export default async function BigBrainPage() {
  const supabase = await createClient();

  const [{ data: niches }, { data: subniches }, { data: bigBrains }] =
    await Promise.all([
      supabase.from("niches").select("id, name").order("name"),
      supabase.from("subniches").select("id, name, niche_id").order("name"),
      supabase
        .from("big_brain")
        .select("niche_id, subniche_id, content, updated_at"),
    ]);

  if (!niches || niches.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Big Brain</h1>
          <p className="text-white/50 mt-1">
            Inteligência estratégica por nicho.
          </p>
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-xl p-16 text-center">
          <div className="w-14 h-14 rounded-full bg-[#771FE3]/10 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-7 h-7 text-[#771FE3]/50" />
          </div>
          <p className="text-white/50 font-medium mb-1">Nenhum nicho cadastrado</p>
          <p className="text-white/30 text-sm mb-6">
            Cadastre nichos antes de alimentar o Big Brain.
          </p>
          <Link
            href="/admin/niches"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#771FE3] to-[#8F68C1] text-white text-sm font-semibold rounded-lg hover:from-[#6a1bcc] hover:to-[#7d5aad] transition-all"
          >
            Ir para Nichos
          </Link>
        </div>
      </div>
    );
  }

  // Build enriched niche structure
  const enrichedNiches = niches.map((niche) => ({
    ...niche,
    subniches: (subniches ?? []).filter((s) => s.niche_id === niche.id),
  }));

  // Build a record keyed by `nicheId` or `nicheId__subnicheId`
  const bigBrainRecord: Record<
    string,
    { niche_id: string; subniche_id: string | null; content: string; updated_at: string }
  > = {};
  for (const entry of bigBrains ?? []) {
    const key = entry.subniche_id
      ? `${entry.niche_id}__${entry.subniche_id}`
      : entry.niche_id;
    bigBrainRecord[key] = entry;
  }

  const filledCount = Object.keys(bigBrainRecord).length;
  const totalSlots =
    (niches?.length ?? 0) + (subniches?.length ?? 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white">Big Brain</h1>
          <p className="text-white/50 mt-1">
            Inteligência estratégica por nicho — base de todo o conteúdo gerado.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{filledCount}</p>
            <p className="text-xs text-white/40">de {totalSlots} preenchidos</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#771FE3] to-[#8F68C1] flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      <BigBrainEditor niches={enrichedNiches} bigBrainRecord={bigBrainRecord} />
    </div>
  );
}
