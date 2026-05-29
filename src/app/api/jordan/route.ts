import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  const { companyId, messages = [] } = await req.json();

  if (!companyId) {
    return NextResponse.json({ error: "companyId obrigatório" }, { status: 400 });
  }

  const supabase = await createClient();

  const [{ data: brandBrain }, { data: briefing }] = await Promise.all([
    supabase
      .from("brand_brain")
      .select("tone_of_voice, cta_style, raw_output")
      .eq("company_id", companyId)
      .maybeSingle(),
    supabase
      .from("briefing_answers")
      .select("focus_product, target_audience, differentials")
      .eq("company_id", companyId)
      .maybeSingle(),
  ]);

  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("id", companyId)
    .single();

  if (!brandBrain?.raw_output) {
    return NextResponse.json(
      { error: "Complete o briefing ANIMA para ativar o Jordan" },
      { status: 422 }
    );
  }

  const systemPrompt = `Você é Jordan, consultor especialista em vendas pelo WhatsApp da empresa ${company?.name ?? "do cliente"}.

SOBRE A EMPRESA:
- Produto/serviço foco: ${briefing?.focus_product ?? "não informado"}
- Público-alvo: ${briefing?.target_audience ?? "não informado"}
- Diferenciais: ${briefing?.differentials ?? "não informado"}
- Tom de voz: ${brandBrain.tone_of_voice ?? "não informado"}
- Estilo de CTA: ${brandBrain.cta_style ?? "não informado"}

PLAYBOOK DE VENDAS:
- Responder em até 5 minutos após o lead entrar
- Nunca começar vendendo — primeiro criar conexão e entender a necessidade
- Nunca mandar preço antes de construir valor
- Fluxo: Conexão → Diagnóstico → Autoridade → Solução → Oferta → Fechamento
- Follow-up: Dia 1 (contato), Dia 2 (retorno leve), Dia 3 (valor), Dia 5 (urgência), Dia 7+ (reativação)
- Nunca abandonar lead sem resposta
- Sempre conduzir para o próximo passo, nunca terminar com "qualquer coisa me avisa"

Seu objetivo é ajudar o usuário a converter mais leads. Quando colarem uma conversa de WhatsApp, analise e sugira exatamente o que responder. Quando descreverem uma situação, dê scripts prontos para usar. Seja direto, prático e sempre personalizado para o contexto da empresa.`;

  const stream = await anthropic.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: systemPrompt,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
