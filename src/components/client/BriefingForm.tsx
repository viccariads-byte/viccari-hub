"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, Loader2, CheckCircle2 } from "lucide-react";
import { saveBriefingStep, type StepData } from "@/lib/actions/briefing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const SOCIAL_NETWORKS = ["Instagram","Facebook","TikTok","YouTube","LinkedIn","Pinterest","Twitter/X","WhatsApp"];
const ARCHETYPES = ["Herói","Mago","Criador","Cuidador","Explorador","Fora-da-lei","Amante","Bobo da corte","Sábio","Inocente","Governante","Cara comum"];
const EDITORIAL_PILLARS = ["Autoridade","Conversão","Engajamento","Branding","Quebra de crença","Storytelling","Bastidores","Prova social","Educação","Conexão","Entretenimento","Inspiração"];

const STEPS = [
  { number: 1, title: "Operacional", subtitle: "Dados básicos da empresa" },
  { number: 2, title: "Público e Concorrência", subtitle: "Quem você atende e enfrenta" },
  { number: 3, title: "Ofertas e Metas", subtitle: "O que você vende e quando" },
  { number: 4, title: "Identidade e Voz", subtitle: "Como a marca se comunica" },
  { number: 5, title: "Alma da Marca", subtitle: "Propósito e posicionamento" },
];

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

export function BriefingForm({ existingData, savedStep }: Props) {
  const [step, setStep] = useState(savedStep > 0 && savedStep <= 5 ? savedStep : 1);
  const [isPending, startTransition] = useTransition();
  const [completed, setCompleted] = useState(false);

  const init = existingData ?? {};

  const [data, setData] = useState<Record<string, string | string[]>>({
    nome_empresa: (init.nome_empresa as string) ?? "",
    instagram: (init.instagram as string) ?? "",
    segmento: (init.segmento as string) ?? "",
    cidade: (init.cidade as string) ?? "",
    contato: (init.contato as string) ?? "",
    site: (init.site as string) ?? "",
    google_meu_negocio: (init.google_meu_negocio as string) ?? "",
    redes_sociais: (init.redes_sociais as string[]) ?? [],
    persona_principal: (init.persona_principal as string) ?? "",
    dores: (init.dores as string) ?? "",
    desejos: (init.desejos as string) ?? "",
    objecoes_compra: (init.objecoes_compra as string) ?? "",
    concorrentes: (init.concorrentes as string) ?? "",
    diferenciais_concorrencia: (init.diferenciais_concorrencia as string) ?? "",
    produtos_servicos: (init.produtos_servicos as string) ?? "",
    ticket_medio: (init.ticket_medio as string) ?? "",
    produto_foco: (init.produto_foco as string) ?? "",
    sazonalidade: (init.sazonalidade as string) ?? "",
    meses_fortes: (init.meses_fortes as string[]) ?? [],
    meses_fracos: (init.meses_fracos as string[]) ?? [],
    datas_importantes: (init.datas_importantes as string) ?? "",
    tom_de_voz: (init.tom_de_voz as string) ?? "",
    palavras_marca: (init.palavras_marca as string) ?? "",
    evitar: (init.evitar as string) ?? "",
    frases_tipicas: (init.frases_tipicas as string) ?? "",
    cores: (init.cores as string) ?? "",
    fonte: (init.fonte as string) ?? "",
    estilo_visual: (init.estilo_visual as string) ?? "",
    referencias_instagram: (init.referencias_instagram as string) ?? "",
    frase_elevador: (init.frase_elevador as string) ?? "",
    o_que_torna_unica: (init.o_que_torna_unica as string) ?? "",
    metodo_exclusivo: (init.metodo_exclusivo as string) ?? "",
    arquetipo_marca: (init.arquetipo_marca as string) ?? "",
    posicionamento_emocional: (init.posicionamento_emocional as string) ?? "",
    territorios_conteudo: (init.territorios_conteudo as string) ?? "",
    pilares_editoriais: (init.pilares_editoriais as string[]) ?? [],
    temas_proibidos: (init.temas_proibidos as string) ?? "",
  });

  function set(field: string, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function toggleArray(field: string, value: string) {
    setData((prev) => {
      const arr = (prev[field] as string[]) ?? [];
      return { ...prev, [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  }

  const STEP_FIELDS: Record<number, string[]> = {
    1: ["nome_empresa","instagram","segmento","cidade","contato","site","google_meu_negocio","redes_sociais"],
    2: ["persona_principal","dores","desejos","objecoes_compra","concorrentes","diferenciais_concorrencia"],
    3: ["produtos_servicos","ticket_medio","produto_foco","sazonalidade","meses_fortes","meses_fracos","datas_importantes"],
    4: ["tom_de_voz","palavras_marca","evitar","frases_tipicas","cores","fonte","estilo_visual","referencias_instagram"],
    5: ["frase_elevador","o_que_torna_unica","metodo_exclusivo","arquetipo_marca","posicionamento_emocional","territorios_conteudo","pilares_editoriais","temas_proibidos"],
  };

  function getStepData(s: number): StepData {
    return Object.fromEntries((STEP_FIELDS[s] ?? []).map((f) => [f, data[f]]));
  }

  function handleNext() {
    startTransition(async () => {
      const isLast = step === 5;
      const result = await saveBriefingStep(step, getStepData(step), isLast);
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
            Estamos gerando o Brand Brain da sua marca. Isso pode levar alguns instantes.
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

  const progress = (step / 5) * 100;
  const currentStepInfo = STEPS[step - 1];

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Briefing da Marca</h1>
        <p className="text-white/50 mt-1">Preencha cada etapa para ativarmos sua estratégia.</p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white">
            Etapa {step} <span className="text-white/40">de 5</span>
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

          {/* ─── ETAPA 1 ─── */}
          {step === 1 && <>
            <Field label="Nome da empresa">
              <Input value={data.nome_empresa as string} onChange={(e) => set("nome_empresa", e.target.value)} placeholder="Ex: Clínica Estela" className={inputCls} />
            </Field>
            <Field label="Instagram" hint="Apenas o @, sem link">
              <Input value={data.instagram as string} onChange={(e) => set("instagram", e.target.value)} placeholder="@suamarca" className={inputCls} />
            </Field>
            <Field label="Segmento" hint="Ex: Clínica de estética, Agência de viagens">
              <Input value={data.segmento as string} onChange={(e) => set("segmento", e.target.value)} placeholder="Segmento da empresa" className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Cidade">
                <Input value={data.cidade as string} onChange={(e) => set("cidade", e.target.value)} placeholder="Ex: Ribeirão Preto" className={inputCls} />
              </Field>
              <Field label="Contato principal">
                <Input value={data.contato as string} onChange={(e) => set("contato", e.target.value)} placeholder="Telefone ou e-mail" className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Site">
                <Input value={data.site as string} onChange={(e) => set("site", e.target.value)} placeholder="www.suamarca.com.br" className={inputCls} />
              </Field>
              <Field label="Google Meu Negócio">
                <Input value={data.google_meu_negocio as string} onChange={(e) => set("google_meu_negocio", e.target.value)} placeholder="Sim / Não / Link" className={inputCls} />
              </Field>
            </div>
            <Field label="Redes sociais ativas" hint="Selecione todas em que a marca está presente">
              <Pills options={SOCIAL_NETWORKS} selected={data.redes_sociais as string[]} onToggle={(v) => toggleArray("redes_sociais", v)} />
            </Field>
          </>}

          {/* ─── ETAPA 2 ─── */}
          {step === 2 && <>
            <Field label="Persona principal" hint="Descreva quem é o cliente ideal da marca">
              <Textarea value={data.persona_principal as string} onChange={(e) => set("persona_principal", e.target.value)} placeholder="Ex: Mulheres de 30-50 anos, classe B/C, que buscam autoestima e bem-estar..." className={textareaCls} />
            </Field>
            <Field label="Principais dores do público">
              <Textarea value={data.dores as string} onChange={(e) => set("dores", e.target.value)} placeholder="O que tira o sono do seu cliente?" className={textareaCls} />
            </Field>
            <Field label="Desejos e aspirações">
              <Textarea value={data.desejos as string} onChange={(e) => set("desejos", e.target.value)} placeholder="O que o seu cliente mais quer alcançar?" className={textareaCls} />
            </Field>
            <Field label="Objeções de compra" hint="Por que as pessoas hesitam em contratar?">
              <Textarea value={data.objecoes_compra as string} onChange={(e) => set("objecoes_compra", e.target.value)} placeholder="Ex: Preço alto, medo de não funcionar, falta de tempo..." className={textareaCls} />
            </Field>
            <Field label="3 principais concorrentes" hint="Nome e @ do Instagram">
              <Textarea value={data.concorrentes as string} onChange={(e) => set("concorrentes", e.target.value)} placeholder={"1. Nome — @perfil\n2. Nome — @perfil\n3. Nome — @perfil"} className={textareaCls} />
            </Field>
            <Field label="Diferenciais frente aos concorrentes" hint="O que você faz melhor ou diferente?">
              <Textarea value={data.diferenciais_concorrencia as string} onChange={(e) => set("diferenciais_concorrencia", e.target.value)} placeholder="O que torna sua empresa melhor que as alternativas?" className={textareaCls} />
            </Field>
          </>}

          {/* ─── ETAPA 3 ─── */}
          {step === 3 && <>
            <Field label="Produtos e serviços oferecidos">
              <Textarea value={data.produtos_servicos as string} onChange={(e) => set("produtos_servicos", e.target.value)} placeholder="Liste os principais produtos/serviços" className={textareaCls} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Ticket médio" hint="Valor médio por venda">
                <Input value={data.ticket_medio as string} onChange={(e) => set("ticket_medio", e.target.value)} placeholder="Ex: R$ 350,00" className={inputCls} />
              </Field>
              <Field label="Produto/serviço foco" hint="O que destacar agora?">
                <Input value={data.produto_foco as string} onChange={(e) => set("produto_foco", e.target.value)} placeholder="Ex: Harmonização facial" className={inputCls} />
              </Field>
            </div>
            <Field label="Sazonalidade" hint="Como as vendas variam ao longo do ano?">
              <Textarea value={data.sazonalidade as string} onChange={(e) => set("sazonalidade", e.target.value)} placeholder="Ex: Vendas aumentam no verão e em dezembro..." className={textareaCls} />
            </Field>
            <Field label="Meses mais fortes">
              <Pills options={MONTHS} selected={data.meses_fortes as string[]} onToggle={(v) => toggleArray("meses_fortes", v)} />
            </Field>
            <Field label="Meses mais fracos">
              <Pills options={MONTHS} selected={data.meses_fracos as string[]} onToggle={(v) => toggleArray("meses_fracos", v)} />
            </Field>
            <Field label="Datas importantes do setor" hint="Feriados, comemorativas, eventos relevantes">
              <Textarea value={data.datas_importantes as string} onChange={(e) => set("datas_importantes", e.target.value)} placeholder="Ex: Dia da Beleza (1/8), Black Friday, Carnaval..." className={textareaCls} />
            </Field>
          </>}

          {/* ─── ETAPA 4 ─── */}
          {step === 4 && <>
            <Field label="Tom de voz" hint="Como a marca fala com seu público?">
              <Textarea value={data.tom_de_voz as string} onChange={(e) => set("tom_de_voz", e.target.value)} placeholder="Ex: Acolhedor, profissional sem ser formal, usa humor leve..." className={textareaCls} />
            </Field>
            <Field label="Palavras que representam a marca" hint="5 a 10 palavras-chave da identidade">
              <Textarea value={data.palavras_marca as string} onChange={(e) => set("palavras_marca", e.target.value)} placeholder="Ex: Transformação, cuidado, confiança, resultado, exclusividade..." className={textareaCls} />
            </Field>
            <Field label="O que evitar na comunicação">
              <Textarea value={data.evitar as string} onChange={(e) => set("evitar", e.target.value)} placeholder="Ex: Linguagem muito técnica, humor grosseiro, promessas exageradas..." className={textareaCls} />
            </Field>
            <Field label="Exemplos de frases típicas da marca">
              <Textarea value={data.frases_tipicas as string} onChange={(e) => set("frases_tipicas", e.target.value)} placeholder={"Ex: 'Seu melhor resultado começa aqui'\n'Cuidamos de você de dentro para fora'"} className={textareaCls} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Cores da marca">
                <Input value={data.cores as string} onChange={(e) => set("cores", e.target.value)} placeholder="Ex: Rosa nude, dourado, branco" className={inputCls} />
              </Field>
              <Field label="Fonte / tipografia">
                <Input value={data.fonte as string} onChange={(e) => set("fonte", e.target.value)} placeholder="Ex: Montserrat, não definida" className={inputCls} />
              </Field>
            </div>
            <Field label="Estilo visual" hint="Ex: Clean, impactante, minimalista, colorido">
              <Input value={data.estilo_visual as string} onChange={(e) => set("estilo_visual", e.target.value)} placeholder="Descreva o estilo visual da marca" className={inputCls} />
            </Field>
            <Field label="Referências de perfis no Instagram" hint="Marcas ou perfis que admira">
              <Textarea value={data.referencias_instagram as string} onChange={(e) => set("referencias_instagram", e.target.value)} placeholder="@perfil1, @perfil2..." className={textareaCls} />
            </Field>
          </>}

          {/* ─── ETAPA 5 ─── */}
          {step === 5 && <>
            <Field label="Frase de elevador" hint="Proposta de valor em 1-2 frases. O que você faz, para quem e qual resultado?">
              <Textarea value={data.frase_elevador as string} onChange={(e) => set("frase_elevador", e.target.value)} placeholder="Ex: Ajudamos mulheres a se sentirem confiantes através de procedimentos estéticos seguros e personalizados." className={textareaCls} />
            </Field>
            <Field label="O que torna a marca única" hint="Qual é o diferencial que ninguém mais tem?">
              <Textarea value={data.o_que_torna_unica as string} onChange={(e) => set("o_que_torna_unica", e.target.value)} placeholder="Ex: Atendimento individual com hora marcada, ambiente premium..." className={textareaCls} />
            </Field>
            <Field label="Método ou entrega exclusiva" hint="Tem um processo, protocolo ou método próprio?">
              <Textarea value={data.metodo_exclusivo as string} onChange={(e) => set("metodo_exclusivo", e.target.value)} placeholder="Ex: Protocolo de 3 etapas para harmonização facial personalizada..." className={textareaCls} />
            </Field>
            <Field label="Arquétipo da marca">
              <select
                value={data.arquetipo_marca as string}
                onChange={(e) => set("arquetipo_marca", e.target.value)}
                className="w-full bg-[#000000] border border-white/10 text-white rounded-md h-10 px-3 text-sm focus:border-[#771FE3] outline-none"
              >
                <option value="">Selecione o arquétipo</option>
                {ARCHETYPES.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="Posicionamento emocional" hint="Qual emoção sua marca deve despertar no público?">
              <Textarea value={data.posicionamento_emocional as string} onChange={(e) => set("posicionamento_emocional", e.target.value)} placeholder="Ex: Confiança, tranquilidade, empoderamento, exclusividade..." className={textareaCls} />
            </Field>
            <Field label="Territórios de conteúdo" hint="Grandes temas que a marca pode abordar">
              <Textarea value={data.territorios_conteudo as string} onChange={(e) => set("territorios_conteudo", e.target.value)} placeholder="Ex: Autoestima, beleza natural, bem-estar, cuidado pessoal..." className={textareaCls} />
            </Field>
            <Field label="Pilares editoriais" hint="Selecione de 3 a 5 pilares prioritários">
              <Pills options={EDITORIAL_PILLARS} selected={data.pilares_editoriais as string[]} onToggle={(v) => toggleArray("pilares_editoriais", v)} max={5} />
            </Field>
            <Field label="Temas proibidos" hint="O que a marca nunca deve abordar ou comentar?">
              <Textarea value={data.temas_proibidos as string} onChange={(e) => set("temas_proibidos", e.target.value)} placeholder="Ex: Política, religião, concorrentes, preços de terceiros..." className={textareaCls} />
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
          ) : step === 5 ? (
            <><CheckCircle2 className="w-4 h-4 mr-2" />Concluir</>
          ) : (
            <>Próxima etapa<ChevronRight className="w-4 h-4 ml-1" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
