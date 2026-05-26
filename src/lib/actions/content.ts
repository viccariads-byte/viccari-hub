"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { anthropic, CLAUDE_MODEL, extractJSON } from "@/lib/anthropic";
import { ContentFormat, ContentStatus, GeneratedContent } from "@/lib/types/database";

const PILLARS = [
  "Autoridade",
  "Conversão",
  "Engajamento",
  "Branding",
  "Quebra de crença",
  "Storytelling",
  "Bastidores",
  "Prova social",
  "Educação",
  "Conexão",
];

export { PILLARS };

const MONTHLY_PLAN: { pillar: string; format: ContentFormat }[] = [
  { pillar: "Autoridade", format: "reels" },
  { pillar: "Conversão", format: "feed" },
  { pillar: "Engajamento", format: "stories" },
  { pillar: "Branding", format: "feed" },
  { pillar: "Quebra de crença", format: "reels" },
  { pillar: "Storytelling", format: "feed" },
  { pillar: "Bastidores", format: "stories" },
  { pillar: "Prova social", format: "reels" },
  { pillar: "Educação", format: "feed" },
  { pillar: "Conexão", format: "stories" },
];

const FORMAT_LABELS: Record<ContentFormat, string> = {
  reels: "Reels",
  feed: "Feed / Carrossel",
  stories: "Stories",
};

function getFormatInstructions(format: ContentFormat): string {
  switch (format) {
    case "reels":
      return `Formato REELS:
- title: título descritivo do vídeo
- hook: frase de abertura dos primeiros 3 segundos (deve parar o scroll imediatamente)
- structure: estrutura de cenas numeradas com duração estimada (ex: "Cena 1 [3s]: apresentação do problema...")
- script: roteiro falado completo, palavra por palavra, fluido e natural
- caption: legenda para o post com emojis e até 5 hashtags relevantes
- cta: call to action em voz alta para o final do vídeo`;

    case "feed":
      return `Formato FEED / CARROSSEL:
- title: título descritivo do carrossel
- hook: headline impactante do primeiro slide (deve gerar curiosidade para arrastar)
- structure: estrutura de todos os slides numerados (ex: "Slide 1: ..., Slide 2: ..., Slide final: CTA")
- script: texto completo de cada slide, conciso e com hierarquia visual clara
- caption: legenda para o post com emojis e até 5 hashtags relevantes
- cta: CTA do último slide e da legenda`;

    case "stories":
      return `Formato STORIES (sequência de 4 a 6 stories):
- title: tema da sequência de stories
- hook: texto do primeiro story (deve criar curiosidade imediata para continuar assistindo)
- structure: sequência de stories com tipo de cada um (ex: "Story 1: texto de abertura, Story 2: enquete — ...]")
- script: texto completo de cada story + enquete ou interação sugerida quando aplicável
- caption: não se aplica a stories — descreva o tema geral
- cta: último story com call to action claro (ex: "Arrasta pra cima", "Manda mensagem", "Clica no link")`;
  }
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

async function generateContentCore(
  supabase: Awaited<ReturnType<typeof createClient>>,
  companyId: string,
  format: ContentFormat,
  pillar: string,
  scheduledDate?: string
): Promise<{ error?: string; data?: GeneratedContent }> {
  // Fetch required data
  const [
    { data: company },
    { data: brandBrain },
    { data: history },
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
      .from("generated_contents")
      .select("hook, title, pillar")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (!brandBrain) {
    return { error: "Brand Brain não encontrado. Gere o Brand Brain antes de criar conteúdo." };
  }

  const historyText =
    history && history.length > 0
      ? history
          .map((h, i) => `${i + 1}. [${h.pillar}] ${h.title ?? ""} — Hook: ${h.hook ?? ""}`)
          .join("\n")
      : "Nenhum conteúdo gerado ainda.";

  const companyInfo = `Marca: ${company?.name ?? ""}
Instagram: ${company?.instagram ?? ""}
Localização: ${company?.city ?? ""}${company?.coverage ? ` (${company.coverage})` : ""}`;

  const prompt = `Gere um conteúdo de ${FORMAT_LABELS[format]} sobre o pilar estratégico "${pillar}" para a marca descrita abaixo.
O conteúdo deve ser específico, natural e totalmente alinhado ao Brand Brain da marca.
Crie conteúdo original, evitando repetir qualquer hook ou tema do histórico.

${getFormatInstructions(format)}

[BRAND BRAIN]:
${formatBrandBrain(brandBrain as Record<string, unknown>)}

[DADOS DA MARCA]:
${companyInfo}

[HISTÓRICO — não repita estes hooks/temas]:
${historyText}`;

  interface ContentJSON {
    title?: string;
    hook?: string;
    structure?: string;
    script?: string;
    caption?: string;
    cta?: string;
  }

  let parsed: ContentJSON = {};
  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system: "Você é um roteirista de conteúdo especialista em marketing digital. Responda APENAS com JSON válido, sem markdown, sem texto adicional.",
      messages: [{ role: "user", content: prompt }],
    });
    const rawText = response.content[0]?.type === "text" ? response.content[0].text : "{}";
    parsed = JSON.parse(extractJSON(rawText)) as ContentJSON;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return { error: `Erro ao chamar a IA: ${msg}` };
  }

  const { data: saved, error: insertError } = await supabase
    .from("generated_contents")
    .insert({
      company_id: companyId,
      format,
      pillar,
      title: parsed.title ?? null,
      hook: parsed.hook ?? null,
      structure: parsed.structure ?? null,
      script: parsed.script ?? null,
      caption: parsed.caption ?? null,
      cta: parsed.cta ?? null,
      status: "gerado",
      scheduled_date: scheduledDate ?? null,
    })
    .select()
    .single();

  if (insertError || !saved) {
    return { error: insertError?.message ?? "Erro ao salvar conteúdo." };
  }

  return { data: saved as GeneratedContent };
}

export async function updateContentStatus(
  contentId: string,
  status: ContentStatus,
  clientNotes?: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!company) return { error: "Empresa não encontrada." };

  const { error } = await supabase
    .from("generated_contents")
    .update({
      status,
      client_notes: clientNotes ?? null,
    })
    .eq("id", contentId)
    .eq("company_id", company.id);

  if (error) return { error: error.message };

  revalidatePath(`/client/calendar/${contentId}`);
  revalidatePath("/client/calendar");
  return { success: true };
}

export async function generateSingleContent(
  companyId: string,
  format: ContentFormat,
  pillar: string
): Promise<{ error?: string; data?: GeneratedContent }> {
  const supabase = await createClient();

  const result = await generateContentCore(supabase, companyId, format, pillar);

  if (!result.error) {
    revalidatePath("/client/calendar");
  }

  return result;
}

export async function generateMonthlyCalendar(
  companyId: string
): Promise<{ error?: string; count?: number }> {
  const supabase = await createClient();

  const { data: brandBrain } = await supabase
    .from("brand_brain")
    .select("id")
    .eq("company_id", companyId)
    .maybeSingle();

  if (!brandBrain) {
    return { error: "Gere o Brand Brain antes de criar o calendário de conteúdo." };
  }

  // Distribute dates through the current month (or next if < 10 days left)
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const startDay = today.getDate() + 1;
  const availableDays = daysInMonth - startDay + 1;

  let year = today.getFullYear();
  let month = today.getMonth();
  let baseDay = startDay;

  // If less than 10 days remain in the month, schedule to next month
  if (availableDays < 10) {
    month = (today.getMonth() + 1) % 12;
    year = month === 0 ? today.getFullYear() + 1 : today.getFullYear();
    baseDay = 1;
  }

  const totalDays = new Date(year, month + 1, 0).getDate();
  const step = Math.floor(totalDays / MONTHLY_PLAN.length);

  let count = 0;
  for (let i = 0; i < MONTHLY_PLAN.length; i++) {
    const { pillar, format } = MONTHLY_PLAN[i];
    const day = Math.min(baseDay + i * step, totalDays);
    const scheduledDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const result = await generateContentCore(
      supabase,
      companyId,
      format,
      pillar,
      scheduledDate
    );

    if (!result.error) count++;
  }

  // Upsert content_calendar record
  await supabase.from("content_calendar").upsert({
    company_id: companyId,
    month: month + 1,
    year,
    generated_at: new Date().toISOString(),
    total_contents: count,
  });

  revalidatePath("/client/calendar");
  revalidatePath(`/admin/clients`);

  return { count };
}
