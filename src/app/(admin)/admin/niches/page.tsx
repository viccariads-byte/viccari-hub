import { createClient } from "@/lib/supabase/server";
import { NicheManager } from "@/components/admin/NicheManager";
import { Tag } from "lucide-react";

export default async function NichesPage() {
  const supabase = await createClient();

  const [{ data: niches }, { data: subniches }, { data: companyNiches }] =
    await Promise.all([
      supabase.from("niches").select("id, name").order("name"),
      supabase.from("subniches").select("id, name, niche_id").order("name"),
      supabase.from("company_niche").select("niche_id, subniche_id"),
    ]);

  // Merge subniches and client counts into niches
  const enrichedNiches = (niches ?? []).map((niche) => ({
    ...niche,
    subniches: (subniches ?? []).filter((s) => s.niche_id === niche.id),
    clientCount: (companyNiches ?? []).filter((cn) => cn.niche_id === niche.id)
      .length,
  }));

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Nichos</h1>
        <p className="text-white/50 mt-1">
          Gerencie os nichos e subnichos disponíveis para os clientes.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-[#771FE3]" />
            <span className="text-xs text-white/40 uppercase tracking-wider">Nichos</span>
          </div>
          <p className="text-3xl font-bold text-white">{niches?.length ?? 0}</p>
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-[#8F68C1]">#</span>
            <span className="text-xs text-white/40 uppercase tracking-wider">Subnichos</span>
          </div>
          <p className="text-3xl font-bold text-white">{subniches?.length ?? 0}</p>
        </div>
      </div>

      <NicheManager initialNiches={enrichedNiches} />
    </div>
  );
}
