import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sparkles, AlertTriangle } from "lucide-react";
import { GenerateForm } from "@/components/client/GenerateForm";

export default async function GenerateContentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!company) redirect("/client/dashboard");

  const { data: brandBrain } = await supabase
    .from("brand_brain")
    .select("id")
    .eq("company_id", company.id)
    .maybeSingle();

  const hasBrandBrain = !!brandBrain;

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#771FE3] to-[#8F68C1]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Gerar Conteúdo</h1>
        </div>
        <p className="text-white/40 text-sm">
          Escolha o formato e o pilar estratégico para gerar um roteiro personalizado para sua marca.
        </p>
      </div>

      {!hasBrandBrain ? (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6 flex gap-4">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-medium mb-1">Brand Brain não encontrado</p>
            <p className="text-white/50 text-sm">
              Seu Brand Brain ainda está sendo preparado pela equipe da Viccari Ads.
              Assim que estiver pronto, você poderá gerar conteúdos personalizados aqui.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#111111] border border-white/10 rounded-xl p-6">
          <GenerateForm companyId={company.id} />
        </div>
      )}
    </div>
  );
}
