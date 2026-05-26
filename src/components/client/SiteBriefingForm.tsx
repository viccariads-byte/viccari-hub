"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, Loader2, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { saveModuleStep } from "@/lib/actions/modules";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const ESTILOS_VISUAIS = ["Moderno/Minimalista", "Corporativo/Sério", "Criativo/Colorido", "Elegante/Luxo", "Jovem/Dinâmico", "Rústico/Orgânico"];
const TONS_DE_VOZ = ["Profissional", "Amigável", "Sofisticado", "Divertido", "Inspirador", "Técnico", "Acolhedor"];
const OPCOES_LOGO = ["Tenho logo pronto", "Preciso criar logo", "Quero revisar minha logo"];
const PAGINAS = ["Home", "Sobre", "Serviços", "Portfólio", "Blog", "Contato", "FAQ", "Depoimentos", "Loja Online", "Área de Membros"];
const SECOES = ["Hero/Banner", "Depoimentos", "Portfólio", "Vídeo Institucional", "Mapa/Localização", "Newsletter", "WhatsApp Flutuante", "Contador/Timer", "Parceiros/Clientes", "Cases de Sucesso"];

const STEPS = [
  { number: 1, title: "Responsável", subtitle: "Quem está solicitando o site" },
  { number: 2, title: "Negócio", subtitle: "Dados da empresa" },
  { number: 3, title: "Identidade Visual", subtitle: "Cores, estilo e referências" },
  { number: 4, title: "Serviços", subtitle: "O que será apresentado no site" },
  { number: 5, title: "Estrutura", subtitle: "Páginas, seções e CTA" },
];

type Service = { nome: string; descricao: string; destaque: boolean };

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

export function SiteBriefingForm({ existingData, savedStep }: Props) {
  const [step, setStep] = useState(savedStep > 0 && savedStep <= 5 ? savedStep : 1);
  const [isPending, startTransition] = useTransition();
  const [completed, setCompleted] = useState(false);

  const init = existingData ?? {};

  const [data, setData] = useState<Record<string, string | string[]>>({
    clientName: (init.clientName as string) ?? "",
    clientEmail: (init.clientEmail as string) ?? "",
    bizName: (init.bizName as string) ?? "",
    bizSeg: (init.bizSeg as string) ?? "",
    bizCity: (init.bizCity as string) ?? "",
    bizWpp: (init.bizWpp as string) ?? "",
    bizEmail: (init.bizEmail as string) ?? "",
    bizSlogan: (init.bizSlogan as string) ?? "",
    bizAbout: (init.bizAbout as string) ?? "",
    c1: (init.c1 as string) ?? "#771FE3",
    c2: (init.c2 as string) ?? "#8F68C1",
    estiloVisual: (init.estiloVisual as string[]) ?? [],
    tomVoz: (init.tomVoz as string[]) ?? [],
    logotipo: (init.logotipo as string[]) ?? [],
    referencias: (init.referencias as string) ?? "",
    ctaPrincipal: (init.ctaPrincipal as string) ?? "",
    paginasDesejadas: (init.paginasDesejadas as string[]) ?? [],
    secoes: (init.secoes as string[]) ?? [],
  });

  const [services, setServices] = useState<Service[]>(
    (init.services as Service[]) ?? [{ nome: "", descricao: "", destaque: false }]
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

  function addService() {
    setServices((s) => [...s, { nome: "", descricao: "", destaque: false }]);
  }

  function removeService(i: number) {
    setServices((s) => s.filter((_, idx) => idx !== i));
  }

  function updateService(i: number, field: keyof Service, value: string | boolean) {
    setServices((s) => s.map((svc, idx) => idx === i ? { ...svc, [field]: value } : svc));
  }

  const STEP_DATA: Record<number, Record<string, unknown>> = {
    1: { clientName: data.clientName, clientEmail: data.clientEmail },
    2: { bizName: data.bizName, bizSeg: data.bizSeg, bizCity: data.bizCity, bizWpp: data.bizWpp, bizEmail: data.bizEmail, bizSlogan: data.bizSlogan, bizAbout: data.bizAbout },
    3: { c1: data.c1, c2: data.c2, estiloVisual: data.estiloVisual, tomVoz: data.tomVoz, logotipo: data.logotipo, referencias: data.referencias },
    4: { services },
    5: { paginasDesejadas: data.paginasDesejadas, secoes: data.secoes, ctaPrincipal: data.ctaPrincipal },
  };

  function handleNext() {
    startTransition(async () => {
      const isLast = step === 5;
      const result = await saveModuleStep("site_briefing", step, STEP_DATA[step], isLast);
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
            Nossa equipe receberá as informações e entrará em contato em breve.
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
        <h1 className="text-3xl font-bold text-white">Briefing de Site</h1>
        <p className="text-white/50 mt-1">Preencha cada etapa para iniciarmos o desenvolvimento.</p>
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

          {/* ─── ETAPA 1 — Responsável ─── */}
          {step === 1 && <>
            <Field label="Nome completo">
              <Input value={data.clientName as string} onChange={(e) => set("clientName", e.target.value)} placeholder="Seu nome" className={inputCls} />
            </Field>
            <Field label="E-mail" hint="Para receber atualizações do projeto">
              <Input type="email" value={data.clientEmail as string} onChange={(e) => set("clientEmail", e.target.value)} placeholder="seu@email.com" className={inputCls} />
            </Field>
          </>}

          {/* ─── ETAPA 2 — Negócio ─── */}
          {step === 2 && <>
            <Field label="Nome da empresa">
              <Input value={data.bizName as string} onChange={(e) => set("bizName", e.target.value)} placeholder="Ex: Clínica Estela" className={inputCls} />
            </Field>
            <Field label="Segmento" hint="Ex: Clínica de estética, Advocacia, Restaurante">
              <Input value={data.bizSeg as string} onChange={(e) => set("bizSeg", e.target.value)} placeholder="Segmento de atuação" className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Cidade">
                <Input value={data.bizCity as string} onChange={(e) => set("bizCity", e.target.value)} placeholder="Ex: São Paulo" className={inputCls} />
              </Field>
              <Field label="WhatsApp">
                <Input value={data.bizWpp as string} onChange={(e) => set("bizWpp", e.target.value)} placeholder="(11) 99999-9999" className={inputCls} />
              </Field>
            </div>
            <Field label="E-mail comercial">
              <Input type="email" value={data.bizEmail as string} onChange={(e) => set("bizEmail", e.target.value)} placeholder="contato@empresa.com.br" className={inputCls} />
            </Field>
            <Field label="Slogan" hint="Frase curta que representa a marca (opcional)">
              <Input value={data.bizSlogan as string} onChange={(e) => set("bizSlogan", e.target.value)} placeholder="Ex: Cuidamos de você de dentro para fora" className={inputCls} />
            </Field>
            <Field label="Sobre a empresa" hint="O que faz, há quanto tempo atua, diferenciais">
              <Textarea value={data.bizAbout as string} onChange={(e) => set("bizAbout", e.target.value)} placeholder="Conte sobre a história e propósito da empresa..." className={textareaCls} />
            </Field>
          </>}

          {/* ─── ETAPA 3 — Identidade Visual ─── */}
          {step === 3 && <>
            <Field label="Cores da marca" hint="Selecione as cores principais">
              <div className="flex items-center gap-6 mt-2">
                <div className="flex flex-col items-center gap-2">
                  <label className="text-xs text-white/40">Cor principal</label>
                  <div className="relative">
                    <input
                      type="color"
                      value={data.c1 as string}
                      onChange={(e) => set("c1", e.target.value)}
                      className="w-14 h-14 rounded-xl cursor-pointer border-2 border-white/10 bg-transparent"
                    />
                  </div>
                  <span className="text-xs text-white/50 font-mono">{data.c1}</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <label className="text-xs text-white/40">Cor de destaque</label>
                  <div className="relative">
                    <input
                      type="color"
                      value={data.c2 as string}
                      onChange={(e) => set("c2", e.target.value)}
                      className="w-14 h-14 rounded-xl cursor-pointer border-2 border-white/10 bg-transparent"
                    />
                  </div>
                  <span className="text-xs text-white/50 font-mono">{data.c2}</span>
                </div>
              </div>
            </Field>

            <Field label="Estilo visual" hint="Como você quer que o site seja percebido?">
              <Pills options={ESTILOS_VISUAIS} selected={data.estiloVisual as string[]} onToggle={(v) => toggleArray("estiloVisual", v)} />
            </Field>

            <Field label="Tom de voz" hint="Como a marca se comunica?">
              <Pills options={TONS_DE_VOZ} selected={data.tomVoz as string[]} onToggle={(v) => toggleArray("tomVoz", v)} />
            </Field>

            <Field label="Logotipo">
              <Pills options={OPCOES_LOGO} selected={data.logotipo as string[]} onToggle={(v) => toggleSingle("logotipo", v)} max={1} />
            </Field>

            <Field label="Referências de sites" hint="Links ou nomes de sites que admira">
              <Textarea value={data.referencias as string} onChange={(e) => set("referencias", e.target.value)} placeholder="Cole links ou descreva sites de referência..." className={textareaCls} />
            </Field>
          </>}

          {/* ─── ETAPA 4 — Serviços ─── */}
          {step === 4 && <>
            <div className="flex items-center justify-between mb-1">
              <p className="text-white/80 text-sm font-medium">Serviços do site</p>
              <button
                type="button"
                onClick={addService}
                className="flex items-center gap-1.5 text-xs text-[#8F68C1] hover:text-[#771FE3] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar serviço
              </button>
            </div>
            <p className="text-white/40 text-xs -mt-3">Liste os serviços ou produtos que aparecerão no site</p>

            <div className="space-y-4">
              {services.map((svc, i) => (
                <div key={i} className="bg-[#000000] border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/30 font-medium">Serviço {i + 1}</span>
                    {services.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeService(i)}
                        className="text-white/20 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <Input
                    placeholder="Nome do serviço"
                    value={svc.nome}
                    onChange={(e) => updateService(i, "nome", e.target.value)}
                    className="bg-[#111111] border-white/10 text-white placeholder:text-white/30 focus:border-[#771FE3] h-9 text-sm"
                  />
                  <Textarea
                    placeholder="Breve descrição do serviço..."
                    value={svc.descricao}
                    onChange={(e) => updateService(i, "descricao", e.target.value)}
                    className="bg-[#111111] border-white/10 text-white placeholder:text-white/30 focus:border-[#771FE3] min-h-[70px] resize-none text-sm"
                  />
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div
                      onClick={() => updateService(i, "destaque", !svc.destaque)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${svc.destaque ? "bg-[#771FE3] border-[#771FE3]" : "border-white/20 bg-transparent"}`}
                    >
                      {svc.destaque && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors">
                      Destacar este serviço no site
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </>}

          {/* ─── ETAPA 5 — Estrutura ─── */}
          {step === 5 && <>
            <Field label="Páginas desejadas" hint="Selecione todas as páginas que o site deve ter">
              <Pills options={PAGINAS} selected={data.paginasDesejadas as string[]} onToggle={(v) => toggleArray("paginasDesejadas", v)} />
            </Field>

            <Field label="Seções especiais" hint="Elementos adicionais para o site">
              <Pills options={SECOES} selected={data.secoes as string[]} onToggle={(v) => toggleArray("secoes", v)} />
            </Field>

            <Field label="CTA principal" hint="Qual ação você quer que o visitante tome?">
              <Input
                value={data.ctaPrincipal as string}
                onChange={(e) => set("ctaPrincipal", e.target.value)}
                placeholder="Ex: Agendar consulta / Solicitar orçamento / Comprar agora"
                className={inputCls}
              />
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
            <><CheckCircle2 className="w-4 h-4 mr-2" />Enviar Briefing</>
          ) : (
            <>Próxima etapa<ChevronRight className="w-4 h-4 ml-1" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
