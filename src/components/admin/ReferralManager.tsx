"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, XCircle, DollarSign } from "lucide-react";
import {
  updateReferralStatus,
  updateCommissionValue,
  updatePaymentStatus,
  type ReferralStatus,
  type PaymentStatus,
} from "@/lib/actions/referrals";
import { toast } from "sonner";

type AdminReferral = {
  id: string;
  referred_name: string;
  referred_email: string | null;
  referred_phone: string | null;
  status: ReferralStatus;
  commission_percent: number | null;
  commission_value: number | null;
  payment_status: PaymentStatus;
  created_at: string;
  closed_at: string | null;
  companies: { name: string } | null;
};

interface ReferralManagerProps {
  referrals: AdminReferral[];
}

const STATUS_OPTIONS: { value: ReferralStatus; label: string; icon: React.ElementType; className: string }[] = [
  { value: "em_negociacao", label: "Em negociação", icon: Clock, className: "bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20" },
  { value: "fechado", label: "Fechado", icon: CheckCircle2, className: "bg-green-500/15 text-green-400 border-green-500/30 hover:bg-green-500/20" },
  { value: "perdido", label: "Perdido", icon: XCircle, className: "bg-white/5 text-white/40 border-white/10 hover:bg-white/10" },
];

function ReferralRow({ referral }: { referral: AdminReferral }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [commissionInput, setCommissionInput] = useState(
    referral.commission_value != null ? String(referral.commission_value) : ""
  );

  function handleStatusChange(status: ReferralStatus) {
    startTransition(async () => {
      const result = await updateReferralStatus(referral.id, status);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Status atualizado.");
      router.refresh();
    });
  }

  function handleCommissionBlur() {
    const val = parseFloat(commissionInput.replace(",", "."));
    if (commissionInput === "" || isNaN(val)) {
      startTransition(async () => {
        await updateCommissionValue(referral.id, null);
        router.refresh();
      });
      return;
    }
    if (val === referral.commission_value) return;
    startTransition(async () => {
      const result = await updateCommissionValue(referral.id, val);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Valor de comissão salvo.");
      router.refresh();
    });
  }

  function handlePaymentToggle() {
    const next: PaymentStatus = referral.payment_status === "pendente" ? "pago" : "pendente";
    startTransition(async () => {
      const result = await updatePaymentStatus(referral.id, next);
      if (result.error) { toast.error(result.error); return; }
      toast.success(next === "pago" ? "Marcado como pago." : "Marcado como pendente.");
      router.refresh();
    });
  }

  return (
    <tr className={`border-b border-white/5 last:border-0 ${isPending ? "opacity-60" : ""}`}>
      {/* Company */}
      <td className="py-4 pr-4">
        <p className="text-sm font-medium text-white truncate max-w-[120px]">
          {referral.companies?.name ?? "—"}
        </p>
      </td>

      {/* Referred person */}
      <td className="py-4 pr-4">
        <p className="text-sm text-white font-medium">{referral.referred_name}</p>
        {referral.referred_email && (
          <p className="text-xs text-white/30 mt-0.5">{referral.referred_email}</p>
        )}
        {referral.referred_phone && !referral.referred_email && (
          <p className="text-xs text-white/30 mt-0.5">{referral.referred_phone}</p>
        )}
      </td>

      {/* Date */}
      <td className="py-4 pr-4 text-xs text-white/40">
        {new Date(referral.created_at).toLocaleDateString("pt-BR")}
      </td>

      {/* Status buttons */}
      <td className="py-4 pr-4">
        <div className="flex gap-1">
          {STATUS_OPTIONS.map(({ value, label, icon: Icon, className }) => (
            <button
              key={value}
              onClick={() => referral.status !== value && handleStatusChange(value)}
              disabled={isPending}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-all ${
                referral.status === value
                  ? className + " opacity-100"
                  : "bg-white/5 text-white/25 border-white/5 hover:bg-white/10 hover:text-white/50"
              }`}
            >
              <Icon className="w-3 h-3" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </td>

      {/* Commission */}
      <td className="py-4 pr-4">
        <div className="flex items-center gap-2">
          {referral.commission_percent != null && (
            <span className="text-xs text-[#8F68C1] font-semibold bg-[#771FE3]/10 px-1.5 py-0.5 rounded">
              {referral.commission_percent}%
            </span>
          )}
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 text-xs">R$</span>
            <input
              type="text"
              value={commissionInput}
              onChange={(e) => setCommissionInput(e.target.value)}
              onBlur={handleCommissionBlur}
              placeholder="0,00"
              disabled={isPending || referral.status !== "fechado"}
              className="w-24 bg-[#000000] border border-white/10 rounded-lg pl-7 pr-2 py-1.5 text-xs text-white focus:border-[#771FE3]/50 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </td>

      {/* Payment */}
      <td className="py-4">
        <button
          onClick={handlePaymentToggle}
          disabled={isPending || referral.status !== "fechado"}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
            referral.payment_status === "pago"
              ? "bg-green-500/15 text-green-400 border-green-500/20 hover:bg-green-500/20"
              : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/15"
          }`}
        >
          <DollarSign className="w-3 h-3" />
          {referral.payment_status === "pago" ? "Pago" : "Pendente"}
        </button>
      </td>
    </tr>
  );
}

export function ReferralManager({ referrals }: ReferralManagerProps) {
  const totalClosed = referrals.filter((r) => r.status === "fechado").length;
  const totalPending = referrals.filter(
    (r) => r.status === "fechado" && r.payment_status === "pendente" && r.commission_value != null
  ).length;
  const totalPaid = referrals
    .filter((r) => r.payment_status === "pago" && r.commission_value != null)
    .reduce((s, r) => s + (r.commission_value ?? 0), 0);

  if (referrals.length === 0) {
    return (
      <div className="bg-[#111111] border border-white/10 rounded-xl p-16 text-center">
        <p className="text-white/30 text-sm">Nenhuma indicação registrada ainda.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
          <p className="text-xs text-white/40 mb-1">Total de indicações</p>
          <p className="text-2xl font-bold text-white">{referrals.length}</p>
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
          <p className="text-xs text-white/40 mb-1">Fechadas / Pendentes pagamento</p>
          <p className="text-2xl font-bold text-white">
            {totalClosed} <span className="text-sm text-amber-400 font-normal">/ {totalPending} aguardando</span>
          </p>
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
          <p className="text-xs text-white/40 mb-1">Total pago</p>
          <p className="text-2xl font-bold text-green-400">
            {totalPaid > 0
              ? totalPaid.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
              : "R$ 0,00"}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111111] border border-white/10 rounded-xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs text-white/30 font-medium pb-3 pr-4">Cliente</th>
                <th className="text-left text-xs text-white/30 font-medium pb-3 pr-4">Indicado</th>
                <th className="text-left text-xs text-white/30 font-medium pb-3 pr-4">Data</th>
                <th className="text-left text-xs text-white/30 font-medium pb-3 pr-4">Status</th>
                <th className="text-left text-xs text-white/30 font-medium pb-3 pr-4">Comissão</th>
                <th className="text-left text-xs text-white/30 font-medium pb-3">Pagamento</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((r) => (
                <ReferralRow key={r.id} referral={r} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
