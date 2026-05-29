"use server";

import { createClient } from "@/lib/supabase/server";
import { anthropic, CLAUDE_MODEL, extractJSON } from "@/lib/anthropic";

export interface LpBriefData {
  id: string;
  headline: string;
  sub_headline: string;
  hero_section: string;
  pain_points: string;
  solution_section: string;
  differentials: string[];
  social_proof: string;
  offer_and_cta: string;
  faq: string;
  contact_footer: string;
  raw_output: string;
  created_at: string;
  updated_at: string;
}

export async function generateLpBrief(
  companyId: string
): Promise<{ success: true; data: LpBriefData } | { success: false; error: string }> {
  const supabase = await createClient();

  const [{ data: brandBrain }, { data: briefing }] = await Promise.all([
    supabase
      .from("brand_brain")
      .select("raw_output, tone_of_voice, archetype, dominant_emotion, cta_style")
      .eq("company_id", companyId)
      .maybeSingle(),
    supabase
      .from("briefing_answers")
      .select(
        "focus_product, target_audience, pains, desires, objections, differentials, brand_perception"
      )
      .eq("company_id", companyId)
      .maybeSingle(),
  ]);

  if (!brandBrain?.raw_output) {
    return { success: false, error: "Brand Brain não encontrado. Gere o Brand Brain antes do Briefing de LP." };
  }

  const prompt = `Gere uma estrutura completa de Landing Page para esta marca.

BRAND BRAIN DA MARCA:
${brandBrain.raw_output}

DADOS DO BRIEFING:
- Produto/Serviço foco: ${briefing?.focus_product ?? "não informado"}
- Público-alvo: ${briefing?.target_audience ?? "não informado"}
- Dores do público: ${briefing?.pains ?? "não informado"}
- Desejos do público: ${briefing?.desires ?? "não informado"}
- Objeções de compra: ${briefing?.objections ?? "não informado"}
- Diferenciais: ${briefing?.differentials ?? "não informado"}
- Como quer ser percebido: ${briefing?.brand_perception ?? "não informado"}

Retorne um JSON com esta estrutura exata:
{
  "headline": "Headline principal — proposta de valor direta e impactante",
  "sub_headline": "Sub-headline complementando a proposta com benefício concreto",
  "hero_section": "Texto completo do bloco hero incluindo contexto, dor e solução (2-3 parágrafos)",
  "pain_points": "Bloco abordando as principais dores do público (formato: problema 1, problema 2, problema 3 com texto explicativo)",
  "solution_section": "Apresentação da solução — como a empresa resolve as dores e transforma o cliente",
  "differentials": ["Diferencial 1 com descrição", "Diferencial 2 com descrição", "Diferencial 3 com descrição"],
  "social_proof": "Estrutura sugerida para seção de depoimentos: quem são os clientes ideais, o que devem falar, formato recomendado",
  "offer_and_cta": "Texto da oferta principal e chamada para ação — urgência, benefício e próximo passo",
  "faq": "5 perguntas e respostas baseadas nas objeções mapeadas",
  "contact_footer": "Texto do rodapé de contato — reforço da proposta e facilitação de contato"
}
Responda APENAS com o JSON válido, sem texto adicional.`;

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system:
      "Você é um especialista em copywriting e estruturação de Landing Pages de alta conversão para pequenas e médias empresas brasileiras.",
    messages: [{ role: "user", content: prompt }],
  });

  const rawText = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  let parsed: Omit<LpBriefData, "id" | "created_at" | "updated_at">;
  try {
    parsed = JSON.parse(extractJSON(rawText));
  } catch {
    return { success: false, error: "Erro ao processar resposta da IA. Tente novamente." };
  }

  const upsertData = { ...parsed, company_id: companyId, raw_output: rawText };

  const { data: saved, error: dbError } = await supabase
    .from("lp_brief")
    .upsert(upsertData, { onConflict: "company_id" })
    .select()
    .single();

  if (dbError) {
    return { success: false, error: "Erro ao salvar briefing de LP." };
  }

  return { success: true, data: saved as LpBriefData };
}

export async function getLpBrief(
  companyId: string
): Promise<LpBriefData | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lp_brief")
    .select("*")
    .eq("company_id", companyId)
    .maybeSingle();
  return (data as LpBriefData | null) ?? null;
}
