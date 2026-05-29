"use server";

import { createClient } from "@/lib/supabase/server";
import { anthropic, CLAUDE_MODEL, extractJSON } from "@/lib/anthropic";

export interface MetaCopies {
  primary: string;
  secondary: string;
  retargeting: string;
}

export interface CampaignBriefData {
  id: string;
  platform: "meta" | "google" | "both";
  campaign_objective: string;
  target_audience: string;
  meta_copies: MetaCopies | null;
  google_headlines: string[] | null;
  google_descriptions: string[] | null;
  cta_by_objective: string;
  funnel_strategy: string;
  raw_output: string;
  created_at: string;
  updated_at: string;
}

export async function generateCampaignBrief(
  companyId: string,
  platform: "meta" | "google" | "both"
): Promise<{ success: true; data: CampaignBriefData } | { success: false; error: string }> {
  const supabase = await createClient();

  const [{ data: brandBrain }, { data: briefing }] = await Promise.all([
    supabase
      .from("brand_brain")
      .select("raw_output, tone_of_voice, cta_style, dominant_emotion")
      .eq("company_id", companyId)
      .maybeSingle(),
    supabase
      .from("briefing_answers")
      .select(
        "focus_product, target_audience, pains, desires, objections, differentials, ad_budget, ad_platforms"
      )
      .eq("company_id", companyId)
      .maybeSingle(),
  ]);

  if (!brandBrain?.raw_output) {
    return { success: false, error: "Brand Brain não encontrado. Gere o Brand Brain antes do Briefing de Campanha." };
  }

  const includesMeta = platform === "meta" || platform === "both";
  const includesGoogle = platform === "google" || platform === "both";

  const platformLabel =
    platform === "meta" ? "Meta Ads (Facebook e Instagram)"
    : platform === "google" ? "Google Ads"
    : "Meta Ads e Google Ads";

  const metaSection = includesMeta ? `
  "meta_copies": {
    "primary": "Texto principal do anúncio Meta (máx 125 caracteres, direto e orientado à dor/desejo)",
    "secondary": "Variação secundária com abordagem diferente (autoridade ou prova social)",
    "retargeting": "Copy de retargeting para quem já viu a página ou interagiu"
  },` : `
  "meta_copies": null,`;

  const googleSection = includesGoogle ? `
  "google_headlines": [
    "Headline 1 (máx 30 chars)", "Headline 2", "Headline 3", "Headline 4", "Headline 5",
    "Headline 6", "Headline 7", "Headline 8", "Headline 9", "Headline 10",
    "Headline 11", "Headline 12", "Headline 13", "Headline 14", "Headline 15"
  ],
  "google_descriptions": [
    "Descrição 1 (máx 90 chars — benefício principal + CTA)",
    "Descrição 2 (máx 90 chars — prova social ou diferencial)",
    "Descrição 3 (máx 90 chars — urgência ou oferta)",
    "Descrição 4 (máx 90 chars — variação emocional)"
  ],` : `
  "google_headlines": null,
  "google_descriptions": null,`;

  const prompt = `Gere um briefing completo de campanha para ${platformLabel}.

BRAND BRAIN DA MARCA:
${brandBrain.raw_output}

DADOS DO BRIEFING:
- Produto/Serviço foco: ${briefing?.focus_product ?? "não informado"}
- Público-alvo: ${briefing?.target_audience ?? "não informado"}
- Dores do público: ${briefing?.pains ?? "não informado"}
- Desejos do público: ${briefing?.desires ?? "não informado"}
- Objeções de compra: ${briefing?.objections ?? "não informado"}
- Diferenciais: ${briefing?.differentials ?? "não informado"}
- Investimento mensal em anúncios: ${briefing?.ad_budget ?? "não informado"}

Retorne um JSON com esta estrutura exata:
{
  "campaign_objective": "Objetivo principal da campanha (conversão, geração de leads, reconhecimento)",
  "target_audience": "Descrição detalhada do público para segmentação: idade, interesses, comportamentos, localização",${metaSection}${googleSection}
  "cta_by_objective": "CTA recomendado por estágio do funil: Topo (consciência), Meio (consideração), Fundo (decisão)",
  "funnel_strategy": "Estratégia de funil completa: como estruturar campanhas de topo, meio e fundo, verba sugerida por fase, público de cada fase"
}
Responda APENAS com o JSON válido, sem texto adicional.`;

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system:
      "Você é um especialista em tráfego pago com foco em Meta Ads e Google Ads para pequenas e médias empresas brasileiras. Crie copies persuasivos, diretos e dentro dos limites de caracteres das plataformas.",
    messages: [{ role: "user", content: prompt }],
  });

  const rawText = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  let parsed: Partial<CampaignBriefData>;
  try {
    parsed = JSON.parse(extractJSON(rawText));
  } catch {
    return { success: false, error: "Erro ao processar resposta da IA. Tente novamente." };
  }

  const upsertData = {
    ...parsed,
    platform,
    company_id: companyId,
    raw_output: rawText,
  };

  const { data: saved, error: dbError } = await supabase
    .from("campaign_brief")
    .upsert(upsertData, { onConflict: "company_id" })
    .select()
    .single();

  if (dbError) {
    return { success: false, error: "Erro ao salvar briefing de campanha." };
  }

  return { success: true, data: saved as CampaignBriefData };
}

export async function getCampaignBrief(companyId: string): Promise<CampaignBriefData | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaign_brief")
    .select("*")
    .eq("company_id", companyId)
    .maybeSingle();
  return (data as CampaignBriefData | null) ?? null;
}
