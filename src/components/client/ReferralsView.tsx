"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Link2,
  Handshake,
  Banknote,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  XCircle,
  MessageCircle,
  Camera,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { addReferral } from "@/lib/actions/referrals";
import { toast } from "sonner";

interface Referral {
  id: string;
  referred_name: string;
  referred_email: string | null;
  referred_phone: string | null;
  status: "em_negociacao" | "fechado" | "perdido";
  commission_percent: number | null;
  commission_value: number | null;
  payment_status: "pendente" | "pago";
  created_at: string;
  closed_at: string | null;
}

interface ReferralsViewProps {
  companyId: string;
  referrals: Referral[];
}

const COMMISSION_TIERS = [
  { count: "1 indicação no mês", percent: 20, highlight: false },
  { count: "2 indicações no mês", percent: 35, highlight: false },
  { count: "3 ou mais indicações", percent: 50, highlight: true },
];

function buildMessages(link: string) {
  return [
    {
      key: "msg1",
      channel: "whatsapp" as const,
      label: "WhatsApp casual",
      text: `Oi [Nome]! Tô usando um serviço de tráfego pago aqui que tá me trazendo resultado de verdade. Se você tiver interesse em anunciar no Instagram ou Google, me fala que te passo o contato. Tem um link aqui também: ${link}`,
    },
    {
      key: "msg2",
      channel: "whatsapp" as const,
      label: "WhatsApp direto",
      text: `[Nome], você já pensou em usar anúncios pagos pra atrair mais clientes? A agência que cuida das minhas campanhas é muito boa — resultados reais, atendimento próximo. Se quiser conhecer: ${link}`,
    },
    {
      key: "msg3",
      channel: "instagram" as const,
      label: "Stories do Instagram",
      text: `Parceria que gera resultado 🚀 Se você quer crescer com tráfego pago de verdade, conhece a @viccariads. Tô indicando com confiança. Link na bio!`,
    },
    {
      key: "msg4",
      channel: "whatsapp" as const,
      label: "Grupos de WhatsApp",
      text: `Pessoal, quem aqui quer atrair mais clientes pelo Instagram ou Google? A agência que gerencia meu tráfego tá com um atendimento incrível. Vale muito conhecer 👉 ${link}`,
    },
    {
      key: "msg5",
      channel: "whatsapp" as const,
      label: "Abordagem com autoridade",
      text: `[Nome], vi que você tem um negócio muito bom e acho que tráfego pago bem feito poderia turbinar muito seus resultados. A agência que cuida das minhas campanhas tem me trazido leads qualificados de verdade. Se quiser, passo seu contato pra eles ou acessa aqui: ${link}`,
    },
  ];
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ReferralsView({ companyId, referrals }: ReferralsViewProps) {
  const router = useRouter();
  const referralLink = `viccariads.com.br/ref/${companyId}`;
  const messages = buildMessages(referralLink);

  const [copied, setCopied] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [isPending, startTransition] = useTransition();

  async function handleCopy(key: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    startTransition(async () => {
      const result = await addReferral(companyId, form);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Indicação registrada com sucesso!");
      setForm({ name: "", email: "", phone: "" });
      setShowForm(false);
      router.refresh();
    });
  }

  // Earnings
  const now = new Date();
  const closedThisMonth = referrals.filter((r) => {
    if (r.status !== "fechado" || !r.closed_at) return false;
    const d = new Date(r.closed_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const tierCount = closedThisMonth.length;
  const currentTier = tierCount >= 3 ? 50 : tierCount === 2 ? 35 : 20;

  const totalEarned = referrals
    .filter((r) => r.status === "fechado" && r.commission_value != null)
    .reduce((s, r) => s + (r.commission_value ?? 0), 0);
  const paidAmount = referrals
    .filter((r) => r.payment_status === "pago" && r.commission_value != null)
    .reduce((s, r) => s + (r.commission_value ?? 0), 0);
  const pendingAmount = referrals
    .filter((r) => r.status === "fechado" && r.payment_status === "pendente" && r.commission_value != null)
    .reduce((s, r) => s + (r.commission_value ?? 0), 0);
  const hasEarnings = referrals.some((r) => r.status === "fechado" && r.commission_value != null);

  const statusConfig = {
    fechado: { label: "Fechado", icon: CheckCircle2, className: "bg-green-500/15 text-green-400 border-green-500/20" },
    em_negociacao: { label: "Em negociação", icon: Clock, className: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
    perdido: { label: "Perdido", icon: XCircle, className: "bg-white/5 text-white/30 border-white/10" },
  };

  return (
    <div className="space-y-6">
      {/* ── Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4a00b4] via-[#771FE3] to-[#8F68C1] p-8">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">Indique e Ganhe 💜</h1>
          <p className="text-white/80 text-base max-w-lg">
            Receba até <span className="font-bold text-white">50% de comissão</span> direto no seu
            Pix para cada indicação fechada.
          </p>
          {tierCount > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-white font-medium">
              <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
              Este mês: {tierCount} indicação{tierCount !== 1 ? "ões" : ""} fechada{tierCount !== 1 ? "s" : ""} — {currentTier}% de comissão
            </div>
          )}
        </div>
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -right-4 -bottom-8 w-32 h-32 rounded-full bg-white/10" />
      </div>

      {/* ── Como funciona ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Link2, step: "01", title: "Compartilhe seu link", desc: "Copie seu link exclusivo e envie para quem você conhece" },
          { icon: Handshake, step: "02", title: "Indicado fecha contrato", desc: "Quando seu indicado assinar com a Viccari Ads, sua comissão é confirmada" },
          { icon: Banknote, step: "03", title: "Recebe no Pix", desc: "A bonificação cai direto na sua conta. Sem burocracia." },
        ].map(({ icon: Icon, step, title, desc }) => (
          <div key={step} className="bg-[#111111] border border-white/10 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-[#771FE3]/15 flex-shrink-0">
                <Icon className="w-5 h-5 text-[#8F68C1]" />
              </div>
              <div>
                <p className="text-[10px] text-[#8F68C1] font-semibold uppercase tracking-widest mb-1">Passo {step}</p>
                <p className="text-sm font-semibold text-white mb-1">{title}</p>
                <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabela de bonificação ── */}
      <div className="bg-[#111111] border border-white/10 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
          Tabela de Bonificação
        </h2>
        <div className="space-y-2">
          {COMMISSION_TIERS.map(({ count, percent, highlight }) => (
            <div
              key={percent}
              className={`flex items-center justify-between rounded-xl px-5 py-4 transition-all ${
                highlight
                  ? "bg-gradient-to-r from-[#771FE3]/20 to-[#8F68C1]/10 border border-[#771FE3]/40"
                  : "bg-white/[0.03] border border-white/5"
              }`}
            >
              <p className={`text-sm font-medium ${highlight ? "text-white" : "text-white/60"}`}>
                {count}
              </p>
              <div className="flex items-center gap-2">
                {highlight && <span className="text-xs text-[#8F68C1] font-semibold">MÁXIMO</span>}
                <span
                  className={`text-xl font-bold ${highlight ? "text-[#771FE3]" : "text-white/50"}`}
                >
                  {percent}%
                </span>
                <span className={`text-xs ${highlight ? "text-white/70" : "text-white/30"}`}>
                  do 1º mês
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Link de indicação ── */}
      <div className="bg-[#111111] border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Seu Link de Indicação
          </h2>
          <span className="text-xs text-white/30">
            Você já indicou <span className="text-white font-semibold">{referrals.length}</span>{" "}
            pessoa{referrals.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-5">
          <div className="flex-1 bg-[#000000] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white/60 font-mono truncate">
            {referralLink}
          </div>
          <button
            onClick={() => handleCopy("link", referralLink)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex-shrink-0 ${
              copied === "link"
                ? "bg-green-500/15 border border-green-500/20 text-green-400"
                : "bg-gradient-to-r from-[#771FE3] to-[#8F68C1] text-white hover:opacity-90"
            }`}
          >
            {copied === "link" ? <><Check className="w-4 h-4" />Copiado!</> : <><Copy className="w-4 h-4" />Copiar Link</>}
          </button>
        </div>

        {/* Add referral form */}
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 text-sm text-[#8F68C1] hover:text-[#771FE3] transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Indicar alguém manualmente
          {showForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              required
              placeholder="Nome completo *"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="bg-[#000000] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#771FE3]/50 focus:outline-none"
            />
            <input
              type="email"
              placeholder="E-mail (opcional)"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="bg-[#000000] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#771FE3]/50 focus:outline-none"
            />
            <div className="flex gap-2">
              <input
                placeholder="Telefone (opcional)"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="flex-1 bg-[#000000] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#771FE3]/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isPending || !form.name.trim()}
                className="px-4 py-2.5 bg-[#771FE3] text-white text-sm font-semibold rounded-lg hover:bg-[#6a1bcc] disabled:opacity-50 transition-colors"
              >
                {isPending ? "..." : "Indicar"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Mensagens prontas ── */}
      <div className="bg-[#111111] border border-white/10 rounded-xl p-6">
        <button
          type="button"
          onClick={() => setShowMessages(!showMessages)}
          className="w-full flex items-center justify-between"
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Mensagens Prontas para Compartilhar
          </h2>
          {showMessages ? (
            <ChevronUp className="w-4 h-4 text-white/30" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/30" />
          )}
        </button>

        {showMessages && (
          <div className="mt-5 space-y-4">
            {messages.map(({ key, channel, label, text }) => (
              <div key={key} className="border border-white/10 rounded-xl p-4 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {channel === "whatsapp" ? (
                      <MessageCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Camera className="w-4 h-4 text-pink-300" />
                    )}
                    <span className="text-xs font-medium text-white/50">{label}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(key, text)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      copied === key
                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                        : "bg-white/5 border-white/10 text-white/40 hover:text-white/70"
                    }`}
                  >
                    {copied === key ? <><Check className="w-3 h-3" />Copiado!</> : <><Copy className="w-3 h-3" />Copiar</>}
                  </button>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Minhas indicações ── */}
      <div className="bg-[#111111] border border-white/10 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-5">
          Minhas Indicações
        </h2>

        {referrals.length === 0 ? (
          <div className="text-center py-10">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 text-white/10" />
            <p className="text-white/30 text-sm">Você ainda não registrou nenhuma indicação.</p>
            <button
              onClick={() => { setShowForm(true); document.querySelector(".referral-link-section")?.scrollIntoView({ behavior: "smooth" }); }}
              className="mt-4 text-sm text-[#8F68C1] hover:text-[#771FE3] transition-colors"
            >
              Indicar minha primeira pessoa →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs text-white/30 font-medium pb-3 pr-4">Indicado</th>
                  <th className="text-left text-xs text-white/30 font-medium pb-3 pr-4">Data</th>
                  <th className="text-left text-xs text-white/30 font-medium pb-3 pr-4">Status</th>
                  <th className="text-right text-xs text-white/30 font-medium pb-3">Comissão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {referrals.map((r) => {
                  const cfg = statusConfig[r.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={r.id}>
                      <td className="py-3 pr-4">
                        <p className="text-white font-medium">{r.referred_name}</p>
                        {(r.referred_email || r.referred_phone) && (
                          <p className="text-xs text-white/30 mt-0.5">
                            {r.referred_email || r.referred_phone}
                          </p>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-white/40 text-xs">
                        {new Date(r.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${cfg.className}`}>
                          <StatusIcon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {r.status === "fechado" ? (
                          <div>
                            <p className="text-[#8F68C1] font-semibold">
                              {r.commission_percent ? `${r.commission_percent}%` : "—"}
                            </p>
                            {r.commission_value != null ? (
                              <p className="text-xs text-white/40 mt-0.5">
                                {formatCurrency(r.commission_value)}
                              </p>
                            ) : (
                              <p className="text-xs text-white/25 mt-0.5">a confirmar</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Meus ganhos ── */}
      <div className="bg-[#111111] border border-white/10 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-5">
          Meus Ganhos
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1">
            <p className="text-xs text-white/30 mb-1">Total acumulado</p>
            <p className="text-4xl font-bold text-white">
              {hasEarnings ? formatCurrency(totalEarned) : "—"}
            </p>
            {!hasEarnings && (
              <p className="text-xs text-white/30 mt-1">Aguardando indicações fechadas</p>
            )}
          </div>
          <div className="flex gap-3">
            <div className="bg-[#000000] border border-white/10 rounded-xl px-5 py-3 text-center min-w-[120px]">
              <p className="text-xs text-white/30 mb-1">Pago</p>
              <p className="text-lg font-bold text-green-400">
                {paidAmount > 0 ? formatCurrency(paidAmount) : "R$ 0,00"}
              </p>
            </div>
            <div className="bg-[#000000] border border-amber-500/10 rounded-xl px-5 py-3 text-center min-w-[120px]">
              <p className="text-xs text-white/30 mb-1">Pendente</p>
              <p className="text-lg font-bold text-amber-400">
                {pendingAmount > 0 ? formatCurrency(pendingAmount) : "R$ 0,00"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
