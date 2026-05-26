"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { anthropic, CLAUDE_MODEL, extractJSON } from "@/lib/anthropic";

interface BrandBrainJSON {
  tone_of_voice?: string;
  language?: string;
  archetype?: string;
  dominant_emotion?: string;
  cta_style?: string;
  content_structure?: string;
  communication_rules?: string;
  forbidden_words?: string;
  strategic_pillars?: string[];
}

export async function generateBrandBrain(companyId: string) {
  const supabase = await createClient();

  const [
    { data: company },
    { data: briefing },
    { data: companyNiche },
  ] = await Promise.all([
    supabase.from("companies").select("*").eq("id", companyId).single(),
    supabase.from("briefing_answers").select("*").eq("company_id", companyId).single(),
    supabase.from("company_niche").select("niche_id, subniche_id").eq("company_id", companyId).maybeSingle(),
  ]);

  if (!briefing) return { error: "Briefing não encontrado." };

  // Fetch Big Brain for the niche
  let bigBrainContent = "";
  if (companyNiche?.subniche_id) {
    const { data: bigBrain } = await supabase
      .from("big_brain")
      .select("content")
      .eq("subniche_id", companyNiche.subniche_id)
      .maybeSingle();
    bigBrainContent = bigBrain?.content ?? "";
  }
  if (!bigBrainContent && companyNiche?.niche_id) {
    const { data: bigBrain } = await supabase
      .from("big_brain")
      .select("content")
      .eq("niche_id", companyNiche.niche_id)
      .is("subniche_id", null)
      .maybeSingle();
    bigBrainContent = bigBrain?.content ?? "";
  }

  const bd = (briefing.briefing_data as Record<string, unknown>) ?? {};

  const briefingText = `
OPERACIONAL:
Empresa: ${company?.name ?? bd.nome_empresa ?? ""}
Instagram: ${company?.instagram ?? bd.instagram ?? ""}
Segmento: ${bd.segmento ?? ""}
Cidade: ${company?.city ?? bd.cidade ?? ""}
Contato: ${bd.contato ?? ""}
Site: ${bd.site ?? ""}
Redes sociais ativas: ${((bd.redes_sociais as string[]) ?? []).join(", ")}

PÚBLICO E CONCORRÊNCIA:
Persona principal: ${bd.persona_principal ?? ""}
Dores: ${bd.dores ?? ""}
Desejos: ${bd.desejos ?? ""}
Objeções de compra: ${bd.objecoes_compra ?? ""}
Concorrentes principais: ${bd.concorrentes ?? ""}
Diferenciais frente à concorrência: ${bd.diferenciais_concorrencia ?? ""}

OFERTAS E METAS:
Produtos/Serviços: ${bd.produtos_servicos ?? ""}
Ticket médio: ${bd.ticket_medio ?? ""}
Produto foco: ${bd.produto_foco ?? ""}
Sazonalidade: ${bd.sazonalidade ?? ""}
Meses mais fortes: ${((bd.meses_fortes as string[]) ?? []).join(", ")}
Meses mais fracos: ${((bd.meses_fracos as string[]) ?? []).join(", ")}
Datas importantes: ${bd.datas_importantes ?? ""}

IDENTIDADE E VOZ:
Tom de voz: ${bd.tom_de_voz ?? ""}
Palavras que representam a marca: ${bd.palavras_marca ?? ""}
O que evitar: ${bd.evitar ?? ""}
Frases típicas: ${bd.frases_tipicas ?? ""}
Cores: ${bd.cores ?? ""}
Fonte: ${bd.fonte ?? ""}
Estilo visual: ${bd.estilo_visual ?? ""}
Referências no Instagram: ${bd.referencias_instagram ?? ""}

ALMA DA MARCA:
Frase de elevador: ${bd.frase_elevador ?? ""}
O que torna a marca única: ${bd.o_que_torna_unica ?? ""}
Método exclusivo: ${bd.metodo_exclusivo ?? ""}
Arquétipo: ${bd.arquetipo_marca ?? ""}
Posicionamento emocional: ${bd.posicionamento_emocional ?? ""}
Territórios de conteúdo: ${bd.territorios_conteudo ?? ""}
Pilares editoriais: ${((bd.pilares_editoriais as string[]) ?? []).join(", ")}
Temas proibidos: ${bd.temas_proibidos ?? ""}
`.trim();

  const systemPrompt = `Você é um estrategista de conteúdo especialista em marketing digital.
Responda APENAS com JSON válido, sem markdown, sem explicações, sem texto adicional.`;

  const userPrompt = `Analise o briefing abaixo e o contexto do nicho fornecido.
Gere o Brand Brain desta marca com os seguintes campos:
- tone_of_voice: tom de voz da marca (ex: "Profissional e acolhedor, com autoridade sem ser distante")
- language: vocabulário e linguagem própria (ex: "Usa termos do setor, evita jargão técnico excessivo")
- archetype: arquétipo de marca (ex: "O Sábio / O Cuidador")
- dominant_emotion: emoção dominante que a marca deve transmitir (ex: "Confiança e tranquilidade")
- cta_style: estilo de CTA ideal (ex: "Direto, com urgência suave — 'Agende agora' / 'Fale com a gente'")
- content_structure: estrutura de conteúdo ideal (ex: "Problema → Solução → Prova Social → CTA")
- communication_rules: regras de comunicação (ex: "Sempre usar 'você', nunca 'tu'. Foco em benefícios, não características.")
- forbidden_words: palavras e expressões proibidas (ex: "barato, promoção relâmpago, desconto imperdível")
- strategic_pillars: array com 5 a 7 pilares estratégicos prioritários para esta marca

[BRIEFING]:
${briefingText}

[CONTEXTO DO NICHO]:
${bigBrainContent || "Não disponível ainda."}`;

  let parsed: BrandBrainJSON = {};
  let rawOutput = "";

  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    rawOutput = response.content[0]?.type === "text" ? response.content[0].text : "";
    parsed = JSON.parse(extractJSON(rawOutput)) as BrandBrainJSON;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return { error: `Erro ao chamar a IA: ${message}` };
  }

  const { error: upsertError } = await supabase
    .from("brand_brain")
    .upsert({
      company_id: companyId,
      tone_of_voice: parsed.tone_of_voice ?? null,
      language: parsed.language ?? null,
      archetype: parsed.archetype ?? null,
      dominant_emotion: parsed.dominant_emotion ?? null,
      cta_style: parsed.cta_style ?? null,
      content_structure: parsed.content_structure ?? null,
      communication_rules: parsed.communication_rules ?? null,
      forbidden_words: parsed.forbidden_words ?? null,
      strategic_pillars: parsed.strategic_pillars ?? null,
      raw_output: rawOutput,
      updated_at: new Date().toISOString(),
    });

  if (upsertError) return { error: upsertError.message };

  revalidatePath(`/admin/clients`);

  return { success: true };
}
