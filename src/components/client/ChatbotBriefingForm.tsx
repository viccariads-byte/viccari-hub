"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, Loader2, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { saveModuleStep } from "@/lib/actions/modules";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const GENERO_BOT = ["Masculino", "Feminino", "Neutro"];
const TOM_VOZ_BOT = ["Formal", "Informal", "Técnico", "Amigável", "Persuasivo", "Empático"];
const REVELAR_IA = ["Sim, revelamos abertamente", "Não revelamos", "Somente se perguntado"];
const TEM_CATALOGO = ["Sim, tenho catálogo", "Não tenho catálogo"];
const INFORMA_PRECO = ["Sim, informamos o preço", "Não informamos", "Depende do produto/serviço"];
const CANAIS = ["WhatsApp", "Instagram DM", "Site/Widget", "Telegram", "Facebook Messenger", "E-mail"];
const INTEGRACAO_WA = ["Sim, via WhatsApp Business API", "Não, uso WhatsApp pessoal", "Ainda não tenho WA Business"];
const USA_GHL = ["Sim, uso GoHighLevel", "Não uso GHL"];

const STEPS = [
  { number: 1, title: "Empresa", subtitle: "Dados do negócio" },
  { number: 2, title: "Identidade do Bot", subtitle: "Personalidade e objetivo" },
  { number: 3, title: "Produtos", subtitle: "O que o bot irá vender ou apresentar" },
  { number: 4, title: "Comercial", subtitle: "Preços, pagamentos e condições" },
  { number: 5, title: "Regras", subtitle: "Limites e transferências" },
  { number: 6, title: "Integração", subtitle: "Canais e configurações técnicas" },
];

type Produto = { nome: string; descricao: string };

interface Props {
  existingData: Record<string, unknown> | null;
  savedStep: number;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-white/80 text-sm font-medium">{label}</Label>
      {hint && <p className="text-white/40 text-xs">{hint}</p>}
      {children}
    </div>
  );
}

function Pills({ options, selected, onToggle, max }: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  max?: number;
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        const isDisabled = !isSelected && max !== undefined && selected.length >= max;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => !isDisabled && onToggle(opt)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              isSelected
                ? "bg-[#771FE3]/20 border-[#771FE3]/50 text-white"
                : isDisabled
                ? "bg-white/5 border-white/10 text-white/20 cursor-not-allowed"
                : "bg-white/5 border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export function ChatbotBriefingForm({ existingData, savedStep }: Props) {
  const [step, setStep] = useState(savedStep > 0 && savedStep <= 6 ? savedStep : 1);
  const [isPending, startTransition] = useTransition();
  const [completed, setCompleted] = useState(false);

  const init = existingData ?? {};

  const [data, setData] = useState<Record<string, string | string[]>>({
    clientName: (init.clientName as string) ?? "",
    clientEmail: (init.clientEmail as string) ?? "",
    clientWpp: (init.clientWpp as string) ?? "",
    bizName: (init.bizName as string) ?? "",
    bizSeg: (init.bizSeg as string) ?? "",
    bizCity: (init.bizCity as string) ?? "",
    bizRegioes: (init.bizRegioes as string) ?? "",
    bizAbout: (init.bizAbout as string) ?? "",
    nomeBot: (init.nomeBot as string) ?? "",
    generoBot: (init.generoBot as string[]) ?? [],
    tomVoz: (init.tomVoz as string[]) ?? [],
    revelarIA: (init.revelarIA as string[]) ?? [],
    objetivoBot: (init.objetivoBot as string) ?? "",
    sucessoBot: (init.sucessoBot as string) ?? "",
    publicoAlvo: (init.publicoAlvo as string) ?? "",
    priorizacao: (init.priorizacao as string) ?? "",
    naoOferecer: (init.naoOferecer as string) ?? "",
    temCatalogo: (init.temCatalogo as string[]) ?? [],
    linksMaterial: (init.linksMaterial as string) ?? "",
    faq: (init.faq as string) ?? "",
    objecoes: (init.objecoes as string) ?? "",
    informaPreco: (init.informaPreco as string[]) ?? [],
    condicoesPgto: (init.condicoesPgto as string) ?? "",
    politicaDesconto: (init.politicaDesconto as string) ?? "",
    frete: (init.frete as string) ?? "",
    perfisEspeciais: (init.perfisEspeciais as string) ?? "",
    gatilhosTransferencia: (init.gatilhosTransferencia as string) ?? "",
    especialista: (init.especialista as string) ?? "",
    restricoes: (init.restricoes as string) ?? "",
    infoInterna: (init.infoInterna as string) ?? "",
    canais: (init.canais as string[]) ?? [],
    integracaoWA: (init.integracaoWA as string[]) ?? [],
    usaGHL: (init.usaGHL as string[]) ?? [],
    pipeline: (init.pipeline as string) ?? "",
    horario: (init.horario as string) ?? "",
    foraHorario: (init.foraHorario as string) ?? "",
    exemplosReais: (init.exemplosReais as string) ?? "",
    infoExtra: (init.infoExtra as string) ?? "",
  });

  const [produtos, setProdutos] = useState<Produto[]>(
    (init.produtos as Produto[]) ?? [{ nome: "", descricao: "" }]
  );

  function set(field: string, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function toggleArray(field: string, value: string) {
    setData((prev) => {
      const arr = (prev[field] as string[]) ?? [];
      return { ...prev, [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  }

  function toggleSingle(field: string, value: string) {
    setData((prev) => {
      const arr = (prev[field] as string[]) ?? [];
      return { ...prev, [field]: arr.includes(value) ? [] : [value] };
    });
  }

  function addProduto() {
    setProdutos((p) => [...p, { nome: "", descricao: "" }]);
  }

  function removeProduto(i: number) {
    setProdutos((p) => p.filter((_, idx) => idx !== i));
  }

  function updateProduto(i: number, field: keyof Produto, value: string) {
    setProdutos((p) => p.map((pr, idx) => idx === i ? { ...pr, [field]: value } : pr));
  }

  const STEP_DATA: Record<number, Record<string, unknown>> = {
    1: { clientName: data.clientName, clientEmail: data.clientEmail, clientWpp: data.clientWpp, bizName: data.bizName, bizSeg: data.bizSeg, bizCity: data.bizCity, bizRegioes: data.bizRegioes, bizAbout: data.bizAbout },
    2: { nomeBot: data.nomeBot, generoBot: data.generoBot, tomVoz: data.tomVoz, revelarIA: data.revelarIA, objetivoBot: data.objetivoBot, sucessoBot: data.sucessoBot, publicoAlvo: data.publicoAlvo },
    3: { produtos, priorizacao: data.priorizacao, naoOferecer: data.naoOferecer, temCatalogo: data.temCatalogo, linksMaterial: data.linksMaterial, faq: data.faq, objecoes: data.objecoes },
    4: { informaPreco: data.informaPreco, condicoesPgto: data.condicoesPgto, politicaDesconto: data.politicaDesconto, frete: data.frete, perfisEspeciais: data.perfisEspeciais },
    5: { gatilhosTransferencia: data.gatilhosTransferencia, especialista: data.especialista, restricoes: data.restricoes, infoInterna: data.infoInterna },
    6: { canais: data.canais, integracaoWA: data.integracaoWA, usaGHL: data.usaGHL, pipeline: data.pipeline, horario: data.horario, foraHorario: data.foraHorario, exemplosReais: data.exemplosReais, infoExtra: data.infoExtra },
  };

  function handleNext() {
    startTransition(async () => {
      const isLast = step === 6;
      const result = await saveModuleStep("chatbot_briefing", step, STEP_DATA[step], isLast);
      if (result.error) { toast.error(result.error); return; }
      if (isLast) {
        setCompleted(true);
      } else {
        setStep((s) => s + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  const inputCls = "bg-[#000000] border-white/10 text-white placeholder:text-white/30 focus:border-[#771FE3] h-10";
  const textareaCls = "bg-[#000000] border-white/10 text-white placeholder:text-white/30 focus:border-[#771FE3] min-h-[90px] resize-none";

  if (completed) {
    return (
      <div className="max-w-lg">
        <div className="bg-[#111111] border border-[#771FE3]/30 rounded-2xl p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-[#771FE3]/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-[#771FE3]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Briefing enviado!</h2>
          <p className="text-white/50 text-sm mb-6">
            Nossa equipe receberá as informações e iniciará a configuração do chatbot.
          </p>
          <Button
            onClick={() => { window.location.href = "/client/dashboard"; }}
            className="bg-gradient-to-r from-[#771FE3] to-[#8F68C1] text-white border-0"
          >
            Ir para o Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const progress = (step / 6) * 100;
  const currentStepInfo = STEPS[step - 1];

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Briefing de Chatbot</h1>
        <p className="text-white/50 mt-1">Preencha cada bloco para configurarmos seu assistente virtual.</p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white">
            Bloco {step} <span className="text-white/40">de 6</span>
          </span>
          <span className="text-sm text-[#8F68C1] font-medium">{currentStepInfo.title}</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-[#771FE3] to-[#8F68C1] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2.5">
          {STEPS.map((s) => (
            <div key={s.number} className="flex flex-col items-center gap-1">
              <div className={`w-2 h-2 rounded-full transition-all ${s.number < step ? "bg-[#771FE3]" : s.number === step ? "bg-[#8F68C1] scale-125" : "bg-white/15"}`} />
              <span className={`text-[10px] hidden sm:block ${s.number === step ? "text-[#8F68C1]" : "text-white/20"}`}>{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 mb-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">{currentStepInfo.title}</h2>
          <p className="text-white/40 text-sm">{currentStepInfo.subtitle}</p>
        </div>

        <div className="space-y-5">

          {/* ─── BLOCO 1 — Empresa ─── */}
          {step === 1 && <>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nome do responsável">
                <Input value={data.clientName as string} onChange={(e) => set("clientName", e.target.value)} placeholder="Seu nome" className={inputCls} />
              </Field>
              <Field label="WhatsApp do responsável">
                <Input value={data.clientWpp as string} onChange={(e) => set("clientWpp", e.target.value)} placeholder="(11) 99999-9999" className={inputCls} />
              </Field>
            </div>
            <Field label="E-mail do responsável">
              <Input type="email" value={data.clientEmail as string} onChange={(e) => set("clientEmail", e.target.value)} placeholder="seu@email.com" className={inputCls} />
            </Field>
            <Field label="Nome da empresa">
              <Input value={data.bizName as string} onChange={(e) => set("bizName", e.target.value)} placeholder="Ex: Loja da Maria" className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Segmento">
                <Input value={data.bizSeg as string} onChange={(e) => set("bizSeg", e.target.value)} placeholder="Ex: E-commerce de moda" className={inputCls} />
              </Field>
              <Field label="Cidade">
                <Input value={data.bizCity as string} onChange={(e) => set("bizCity", e.target.value)} placeholder="Ex: Belo Horizonte" className={inputCls} />
              </Field>
            </div>
            <Field label="Regiões de atendimento" hint="Cidade, estado ou todo o Brasil?">
              <Input value={data.bizRegioes as string} onChange={(e) => set("bizRegioes", e.target.value)} placeholder="Ex: Todo o Brasil / Somente SP / Grande ABC" className={inputCls} />
            </Field>
            <Field label="Sobre o negócio" hint="O que faz, para quem e qual o principal canal de vendas?">
              <Textarea value={data.bizAbout as string} onChange={(e) => set("bizAbout", e.target.value)} placeholder="Descreva o negócio resumidamente..." className={textareaCls} />
            </Field>
          </>}

          {/* ─── BLOCO 2 — Identidade do Bot ─── */}
          {step === 2 && <>
            <Field label="Nome do bot" hint="Como o assistente vai se apresentar?">
              <Input value={data.nomeBot as string} onChange={(e) => set("nomeBot", e.target.value)} placeholder="Ex: Luna, Max, Bia..." className={inputCls} />
            </Field>
            <Field label="Gênero do bot">
              <Pills options={GENERO_BOT} selected={data.generoBot as string[]} onToggle={(v) => toggleSingle("generoBot", v)} max={1} />
            </Field>
            <Field label="Tom de voz">
              <Pills options={TOM_VOZ_BOT} selected={data.tomVoz as string[]} onToggle={(v) => toggleArray("tomVoz", v)} />
            </Field>
            <Field label="Revelar que é IA?">
              <Pills options={REVELAR_IA} selected={data.revelarIA as string[]} onToggle={(v) => toggleSingle("revelarIA", v)} max={1} />
            </Field>
            <Field label="Objetivo principal do bot" hint="O que o chatbot deve fazer prioritariamente?">
              <Textarea value={data.objetivoBot as string} onChange={(e) => set("objetivoBot", e.target.value)} placeholder="Ex: Qualificar leads, agendar consultas, fechar vendas..." className={textareaCls} />
            </Field>
            <Field label="O que é um atendimento bem-sucedido?" hint="Defina o que significa sucesso para o bot">
              <Textarea value={data.sucessoBot as string} onChange={(e) => set("sucessoBot", e.target.value)} placeholder="Ex: Lead agendou uma consulta / Venda fechada / Lead chegou ao humano qualificado..." className={textareaCls} />
            </Field>
            <Field label="Público-alvo" hint="Quem o bot vai atender?">
              <Textarea value={data.publicoAlvo as string} onChange={(e) => set("publicoAlvo", e.target.value)} placeholder="Ex: Mulheres 25-45 anos interessadas em estética..." className={textareaCls} />
            </Field>
          </>}

          {/* ─── BLOCO 3 — Produtos ─── */}
          {step === 3 && <>
            <div className="flex items-center justify-between mb-1">
              <p className="text-white/80 text-sm font-medium">Produtos e serviços</p>
              <button
                type="button"
                onClick={addProduto}
                className="flex items-center gap-1.5 text-xs text-[#8F68C1] hover:text-[#771FE3] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar
              </button>
            </div>
            <div className="space-y-3">
              {produtos.map((pr, i) => (
                <div key={i} className="bg-[#000000] border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/30">Item {i + 1}</span>
                    {produtos.length > 1 && (
                      <button type="button" onClick={() => removeProduto(i)} className="text-white/20 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <Input
                    placeholder="Nome do produto/serviço"
                    value={pr.nome}
                    onChange={(e) => updateProduto(i, "nome", e.target.value)}
                    className="bg-[#111111] border-white/10 text-white placeholder:text-white/30 focus:border-[#771FE3] h-9 text-sm"
                  />
                  <Textarea
                    placeholder="Descrição, preço, benefícios..."
                    value={pr.descricao}
                    onChange={(e) => updateProduto(i, "descricao", e.target.value)}
                    className="bg-[#111111] border-white/10 text-white placeholder:text-white/30 focus:border-[#771FE3] min-h-[60px] resize-none text-sm"
                  />
                </div>
              ))}
            </div>

            <Field label="Priorização de vendas" hint="O que o bot deve tentar vender primeiro?">
              <Textarea value={data.priorizacao as string} onChange={(e) => set("priorizacao", e.target.value)} placeholder="Ex: Sempre oferecer o plano anual antes do mensal..." className={textareaCls} />
            </Field>
            <Field label="O que NÃO oferecer" hint="Produtos ou situações que o bot deve evitar">
              <Textarea value={data.naoOferecer as string} onChange={(e) => set("naoOferecer", e.target.value)} placeholder="Ex: Não oferecer parcelamento acima de 12x sem aprovação..." className={textareaCls} />
            </Field>
            <Field label="Tem catálogo digital?">
              <Pills options={TEM_CATALOGO} selected={data.temCatalogo as string[]} onToggle={(v) => toggleSingle("temCatalogo", v)} max={1} />
            </Field>
            <Field label="Links de materiais" hint="Catálogo, cardápio, apresentação, etc.">
              <Input value={data.linksMaterial as string} onChange={(e) => set("linksMaterial", e.target.value)} placeholder="Cole os links separados por vírgula" className={inputCls} />
            </Field>
            <Field label="FAQ — Perguntas frequentes" hint="Dúvidas comuns que o bot deve saber responder">
              <Textarea value={data.faq as string} onChange={(e) => set("faq", e.target.value)} placeholder={"P: Qual o prazo de entrega?\nR: 3 a 5 dias úteis..."} className={`${textareaCls} min-h-[120px]`} />
            </Field>
            <Field label="Objeções comuns e como tratar" hint="Como o bot deve responder às principais resistências">
              <Textarea value={data.objecoes as string} onChange={(e) => set("objecoes", e.target.value)} placeholder={"Objeção: 'Tá caro'\nResposta: 'Entendo! Temos condições especiais para...'"} className={textareaCls} />
            </Field>
          </>}

          {/* ─── BLOCO 4 — Comercial ─── */}
          {step === 4 && <>
            <Field label="O bot informa preços?">
              <Pills options={INFORMA_PRECO} selected={data.informaPreco as string[]} onToggle={(v) => toggleSingle("informaPreco", v)} max={1} />
            </Field>
            <Field label="Condições de pagamento" hint="Quais formas o bot pode informar?">
              <Textarea value={data.condicoesPgto as string} onChange={(e) => set("condicoesPgto", e.target.value)} placeholder="Ex: PIX, cartão até 12x, boleto à vista com 5% desconto..." className={textareaCls} />
            </Field>
            <Field label="Política de desconto" hint="O bot pode oferecer desconto? Quando e quanto?">
              <Textarea value={data.politicaDesconto as string} onChange={(e) => set("politicaDesconto", e.target.value)} placeholder="Ex: Pode oferecer 10% se o cliente pedir e for novo cliente..." className={textareaCls} />
            </Field>
            <Field label="Frete / entrega" hint="Informações sobre entrega que o bot deve conhecer">
              <Input value={data.frete as string} onChange={(e) => set("frete", e.target.value)} placeholder="Ex: Frete grátis acima de R$200 / Entrega em 3-5 dias" className={inputCls} />
            </Field>
            <Field label="Perfis especiais de clientes" hint="VIPs, revendedores, atacadistas — como tratar?">
              <Textarea value={data.perfisEspeciais as string} onChange={(e) => set("perfisEspeciais", e.target.value)} placeholder="Ex: Clientes VIP têm 15% de desconto e frete grátis sempre..." className={textareaCls} />
            </Field>
          </>}

          {/* ─── BLOCO 5 — Regras ─── */}
          {step === 5 && <>
            <Field label="Gatilhos para transferir ao humano" hint="Em quais situações o bot deve passar para um atendente?">
              <Textarea value={data.gatilhosTransferencia as string} onChange={(e) => set("gatilhosTransferencia", e.target.value)} placeholder={"Ex:\n- Cliente mencionar reclamação ou reembolso\n- Valor acima de R$5.000\n- Cliente pedir explicitamente falar com humano"} className={`${textareaCls} min-h-[110px]`} />
            </Field>
            <Field label="Especialista / atendente responsável" hint="Nome e contato de quem assume após a transferência">
              <Input value={data.especialista as string} onChange={(e) => set("especialista", e.target.value)} placeholder="Ex: Mariana — (11) 99999-9999" className={inputCls} />
            </Field>
            <Field label="Restrições do bot" hint="O que o bot absolutamente não pode fazer ou falar?">
              <Textarea value={data.restricoes as string} onChange={(e) => set("restricoes", e.target.value)} placeholder="Ex: Nunca prometer prazo de entrega específico / Não falar mal de concorrentes..." className={textareaCls} />
            </Field>
            <Field label="Informações internas confidenciais" hint="O que o bot deve guardar e não revelar?">
              <Textarea value={data.infoInterna as string} onChange={(e) => set("infoInterna", e.target.value)} placeholder="Ex: Nome dos fornecedores, margens de lucro, senhas..." className={textareaCls} />
            </Field>
          </>}

          {/* ─── BLOCO 6 — Integração ─── */}
          {step === 6 && <>
            <Field label="Canais onde o bot irá operar">
              <Pills options={CANAIS} selected={data.canais as string[]} onToggle={(v) => toggleArray("canais", v)} />
            </Field>
            <Field label="Integração WhatsApp Business API">
              <Pills options={INTEGRACAO_WA} selected={data.integracaoWA as string[]} onToggle={(v) => toggleSingle("integracaoWA", v)} max={1} />
            </Field>
            <Field label="Usa GoHighLevel (GHL)?">
              <Pills options={USA_GHL} selected={data.usaGHL as string[]} onToggle={(v) => toggleSingle("usaGHL", v)} max={1} />
            </Field>
            <Field label="Pipeline de vendas" hint="Se usar GHL, qual pipeline o bot deve mover os leads?">
              <Input value={data.pipeline as string} onChange={(e) => set("pipeline", e.target.value)} placeholder="Ex: Leads Frios → Qualificados → Agendados" className={inputCls} />
            </Field>
            <Field label="Horário de atendimento" hint="Quando o bot está ativo?">
              <Input value={data.horario as string} onChange={(e) => set("horario", e.target.value)} placeholder="Ex: Seg a Sex das 8h às 18h / 24 horas" className={inputCls} />
            </Field>
            <Field label="Mensagem fora do horário" hint="O que o bot responde quando não está operando?">
              <Textarea value={data.foraHorario as string} onChange={(e) => set("foraHorario", e.target.value)} placeholder="Ex: Olá! Nosso atendimento funciona de Seg a Sex das 8h às 18h. Deixe sua mensagem..." className={textareaCls} />
            </Field>
            <Field label="Exemplos reais de conversas" hint="Cole exemplos de atendimentos que funcionaram bem (opcional)">
              <Textarea value={data.exemplosReais as string} onChange={(e) => set("exemplosReais", e.target.value)} placeholder="Exemplo de conversa que representa o padrão ideal..." className={textareaCls} />
            </Field>
            <Field label="Informações extras" hint="Qualquer outra informação importante que não foi coberta">
              <Textarea value={data.infoExtra as string} onChange={(e) => set("infoExtra", e.target.value)} placeholder="Informações adicionais relevantes..." className={textareaCls} />
            </Field>
          </>}

        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pb-8">
        <Button
          type="button"
          variant="ghost"
          onClick={() => { setStep((s) => s - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          disabled={step === 1 || isPending}
          className="text-white/50 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>

        <Button
          type="button"
          onClick={handleNext}
          disabled={isPending}
          className="bg-gradient-to-r from-[#771FE3] to-[#8F68C1] hover:from-[#6a1bcc] hover:to-[#7d5aad] text-white border-0 min-w-[160px]"
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>
          ) : step === 6 ? (
            <><CheckCircle2 className="w-4 h-4 mr-2" />Enviar Briefing</>
          ) : (
            <>Próximo bloco<ChevronRight className="w-4 h-4 ml-1" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
