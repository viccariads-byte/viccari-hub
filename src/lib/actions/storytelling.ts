"use server";

import { createClient } from "@/lib/supabase/server";
import { anthropic, CLAUDE_MODEL, extractJSON } from "@/lib/anthropic";

export interface StorytellingRoteiro {
  numero: number;
  pilar: "dor" | "autoridade" | "prova_social" | "bastidor" | "conexao";
  plataforma: string;
  tempo_estimado: string;
  titulo: string;
  hook: { tempo: string; script: string };
  desenvolvimento: { tempo: string; tag: string; script: string; nota: string }[];
  virada: { tempo: string; script: string };
  cta: { tempo: string; script: string };
  caixinha_pergunta: string;
  dicas_producao: string[];
}

export interface StorytellingResult {
  id: string;
  roteiros: StorytellingRoteiro[];
}

export async function generateStorytelling(params: {
  companyId: string;
  platforms: string[];
  quantity: number;
  preferredDays: string[];
  additionalTone: string;
}): Promise<{ success: true; data: StorytellingResult } | { success: false; error: string }> {
  const { companyId, platforms, quantity, preferredDays, additionalTone } = params;

  const supabase = await createClient();

  const [{ data: brandBrain }, { data: companyNiche }] = await Promise.all([
    supabase
      .from("brand_brain")
      .select("raw_output, tone_of_voice, archetype")
      .eq("company_id", companyId)
      .maybeSingle(),
    supabase
      .from("company_niche")
      .select("niche_id, subniche_id")
      .eq("company_id", companyId)
      .maybeSingle(),
  ]);

  if (!brandBrain?.raw_output) {
    return { success: false, error: "Complete o briefing ANIMA antes de gerar roteiros" };
  }

  let bigBrainContent = "";
  if (companyNiche) {
    const { data: bigBrain } = await supabase
      .from("big_brain")
      .select("content")
      .eq("niche_id", companyNiche.niche_id)
      .eq("subniche_id", companyNiche.subniche_id)
      .maybeSingle();
    bigBrainContent = bigBrain?.content ?? "";
  }

  const prompt = `Gere ${quantity} roteiros de conteúdo para as plataformas: ${platforms.join(", ")}.
Dias preferidos: ${preferredDays.length > 0 ? preferredDays.join(", ") : "qualquer dia"}.
Instrução adicional: ${additionalTone || "Nenhuma"}.

BRAND BRAIN DA MARCA:
${brandBrain.raw_output}

${bigBrainContent ? `BIG BRAIN DO NICHO:\n${bigBrainContent}\n` : ""}

Para cada roteiro, retorne um JSON com esta estrutura exata:
{
  "roteiros": [
    {
      "numero": 1,
      "pilar": "dor",
      "plataforma": "Instagram Reels",
      "tempo_estimado": "60s",
      "titulo": "Título do roteiro",
      "hook": { "tempo": "0-3s", "script": "Script do hook" },
      "desenvolvimento": [
        { "tempo": "3-20s", "tag": "Contexto", "script": "Script da cena", "nota": "Dica de produção" }
      ],
      "virada": { "tempo": "20-40s", "script": "Script da virada" },
      "cta": { "tempo": "40-60s", "script": "Script do CTA" },
      "caixinha_pergunta": "Pergunta para caixinha dos stories",
      "dicas_producao": ["Dica 1", "Dica 2"]
    }
  ]
}
Responda APENAS com o JSON válido, sem texto adicional.`;

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8192,
    system:
      "Você é um estrategista de conteúdo especialista em roteiros para redes sociais. Gere roteiros completos, personalizados e prontos para gravar, baseados na identidade da marca fornecida.",
    messages: [{ role: "user", content: prompt }],
  });

  const rawText = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  let roteiros: StorytellingRoteiro[];
  try {
    const parsed = JSON.parse(extractJSON(rawText));
    roteiros = parsed.roteiros;
  } catch {
    return { success: false, error: "Erro ao processar resposta da IA. Tente novamente." };
  }

  const { data: saved, error: dbError } = await supabase
    .from("storytelling_contents")
    .insert({
      company_id: companyId,
      platforms,
      quantity,
      preferred_days: preferredDays,
      additional_tone: additionalTone,
      contents: roteiros,
    })
    .select("id")
    .single();

  if (dbError) {
    return { success: false, error: "Erro ao salvar roteiros. Tente novamente." };
  }

  return { success: true, data: { id: saved.id, roteiros } };
}
