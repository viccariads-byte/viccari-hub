"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { anthropic, CLAUDE_MODEL, extractJSON } from "@/lib/anthropic";

export interface PlaybookContent {
  posicionamento?: string;
  persona?: string;
  oferta?: string;
  argumentacao?: string;
  scripts?: string;
  objecoes?: string;
  frase_posicionamento?: string;
  proposta_valor?: string;
  principal_argumento?: string;
  cta_ideal?: string;
  resposta_objecao?: string;
}

function formatBrandBrain(bb: Record<string, unknown>): string {
  return [
    bb.tone_of_voice ? `Tom de voz: ${bb.tone_of_voice}` : "",
    bb.language ? `Linguagem: ${bb.language}` : "",
    bb.archetype ? `Arquétipo: ${bb.archetype}` : "",
    bb.dominant_emotion ? `Emoção dominante: ${bb.dominant_emotion}` : "",
    bb.cta_style ? `Estilo de CTA: ${bb.cta_style}` : "",
    bb.content_structure ? `Estrutura ideal: ${bb.content_structure}` : "",
    bb.communication_rules ? `Regras: ${bb.communication_rules}` : "",
    bb.forbidden_words ? `Palavras proibidas: ${bb.forbidden_words}` : "",
    bb.strategic_pillars
      ? `Pilares: ${(bb.strategic_pillars as string[]).join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function generatePlaybook(
  companyId: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();

  const [
    { data: company },
    { data: brandBrain },
    { data: briefing },
  ] = await Promise.all([
    supabase
      .from("companies")
      .select("name, instagram, city, coverage")
      .eq("id", companyId)
      .single(),
    supabase
      .from("brand_brain")
      .select("*")
      .eq("company_id", companyId)
      .maybeSingle(),
    supabase
      .from("briefing_answers")
      .select("briefing_data")
      .eq("company_id", companyId)
      .maybeSingle(),
  ]);

  if (!brandBrain) {
    return { error: "Brand Brain não encontrado. Gere o Brand Brain antes de criar o Playbook." };
  }

  const bd = (briefing?.briefing_data as Record<string, unknown>) ?? {};

  const companyInfo = `Empresa: ${company?.name ?? ""}
Instagram: ${company?.instagram ?? ""}
Localização: ${company?.city ?? ""}${company?.coverage ? ` (${company.coverage})` : ""}
Segmento: ${bd.segmento ?? ""}
Produtos/Serviços: ${bd.produtos_servicos ?? ""}
Produto foco: ${bd.produto_foco ?? ""}
Ticket médio: ${bd.ticket_medio ?? ""}
Persona principal: ${bd.persona_principal ?? ""}
Dores: ${bd.dores ?? ""}
Desejos: ${bd.desejos ?? ""}
Objeções de compra: ${bd.objecoes_compra ?? ""}
Diferenciais: ${bd.diferenciais_concorrencia ?? ""}`;

  const prompt = `Com base no Brand Brain e dados da empresa abaixo, crie um Playbook Comercial completo e prático para a equipe de vendas.

Retorne um JSON com exatamente estes campos (use \\n para quebras de linha dentro dos textos, seja detalhado e prático):
- posicionamento: análise completa do posicionamento, diferenciais competitivos, proposta única de valor, como a marca se diferencia no mercado
- persona: perfil detalhado da persona ideal, dores principais, desejos, gatilhos de compra, jornada do cliente
- oferta: como estruturar e apresentar a oferta, formas de ancoragem de preço, o que incluir na proposta comercial
- argumentacao: os 5-7 argumentos de venda mais poderosos, pontos de prova, como demonstrar valor antes de falar de preço
- scripts: scripts prontos para abordagem inicial (presencial e WhatsApp), follow-up, apresentação de proposta, fechamento
- objecoes: as 6-8 objeções mais comuns desta marca com resposta pronta e técnica de contorno para cada uma
- frase_posicionamento: uma única frase de posicionamento impactante (máximo 15 palavras)
- proposta_valor: proposta de valor clara e direta (2-3 linhas)
- principal_argumento: o argumento de venda mais poderoso desta marca (1-2 linhas)
- cta_ideal: call to action ideal para esta marca (máximo 10 palavras)
- resposta_objecao: resposta pronta para a objeção mais comum desta marca (3-5 linhas)

[BRAND BRAIN]:
${formatBrandBrain(brandBrain as Record<string, unknown>)}

[DADOS DA EMPRESA]:
${companyInfo}`;

  let parsed: PlaybookContent = {};
  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 6000,
      system:
        "Você é um consultor comercial especialista em vendas e marketing digital. Responda APENAS com JSON válido, sem markdown, sem texto adicional.",
      messages: [{ role: "user", content: prompt }],
    });
    const rawText =
      response.content[0]?.type === "text" ? response.content[0].text : "{}";
    parsed = JSON.parse(extractJSON(rawText)) as PlaybookContent;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return { error: `Erro ao chamar a IA: ${msg}` };
  }

  const { error } = await supabase.from("playbooks").upsert(
    {
      company_id: companyId,
      content: parsed,
      generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "company_id" }
  );

  if (error) return { error: error.message };

  revalidatePath("/client/modules/playbook");
  revalidatePath("/admin/clients");

  return { success: true };
}
