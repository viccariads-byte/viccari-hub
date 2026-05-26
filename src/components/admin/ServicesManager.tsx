"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Trash2, Loader2, ChevronDown, ChevronUp,
  Megaphone, Search, Paintbrush, Database, BarChart2, Monitor, Bot, FileText, Layers,
} from "lucide-react";
import { addService, updateServiceStatus, removeService, type ServiceStatus } from "@/lib/actions/services";
import { toast } from "sonner";

const PREDEFINED_SERVICES = [
  "Meta Ads", "Google Ads", "Design de Criativos", "CRM",
  "Gestão de Tráfego", "Site", "Chatbot", "LP IA",
];

const SERVICE_ICONS: Record<string, React.ElementType> = {
  "Meta Ads": Megaphone, "Google Ads": Search, "Design de Criativos": Paintbrush,
  "CRM": Database, "Gestão de Tráfego": BarChart2, "Site": Monitor, "Chatbot": Bot, "LP IA": FileText,
};

const STATUS_OPTIONS: { value: ServiceStatus; label: string; className: string }[] = [
  { value: "ativo", label: "Ativo", className: "bg-green-500/15 text-green-400 border-green-500/30 hover:bg-green-500/20" },
  { value: "em_configuracao", label: "Em config.", className: "bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20" },
  { value: "pausado", label: "Pausado", className: "bg-white/5 text-white/40 border-white/10 hover:bg-white/10" },
];

interface Service {
  id: string;
  service_name: string;
  service_status: ServiceStatus;
  service_description: string | null;
}

interface ServicesManagerProps {
  companyId: string;
  services: Service[];
}

const EMPTY_FORM = { service_name: "Meta Ads", service_status: "em_configuracao" as ServiceStatus, service_description: "" };

export function ServicesManager({ companyId, services }: ServicesManagerProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isPending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await addService(companyId, form);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Serviço adicionado.");
      setForm(EMPTY_FORM);
      setShowForm(false);
      router.refresh();
    });
  }

  function handleStatusChange(serviceId: string, status: ServiceStatus) {
    startTransition(async () => {
      const result = await updateServiceStatus(serviceId, status);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Status atualizado.");
      router.refresh();
    });
  }

  function handleRemove(serviceId: string, name: string) {
    startTransition(async () => {
      const result = await removeService(serviceId);
      if (result.error) { toast.error(result.error); return; }
      toast.success(`${name} removido.`);
      router.refresh();
    });
  }

  return (
    <div className="bg-[#111111] border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
          Serviços Contratados
        </h2>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-xs text-[#8F68C1] hover:text-[#771FE3] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar serviço
          {showForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="mb-5 grid grid-cols-2 gap-2.5 p-4 bg-black/20 rounded-xl border border-white/5">
          <div className="col-span-2 grid grid-cols-2 gap-2.5">
            <select value={form.service_name} onChange={(e) => setForm((p) => ({ ...p, service_name: e.target.value }))}
              className="bg-[#000000] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#771FE3]/50 focus:outline-none">
              {PREDEFINED_SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={form.service_status} onChange={(e) => setForm((p) => ({ ...p, service_status: e.target.value as ServiceStatus }))}
              className="bg-[#000000] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#771FE3]/50 focus:outline-none">
              <option value="ativo">Ativo</option>
              <option value="em_configuracao">Em configuração</option>
              <option value="pausado">Pausado</option>
            </select>
          </div>
          <textarea placeholder="Descrição do que está sendo feito (opcional)" value={form.service_description}
            onChange={(e) => setForm((p) => ({ ...p, service_description: e.target.value }))}
            rows={2}
            className="col-span-2 bg-[#000000] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-[#771FE3]/50 focus:outline-none resize-none" />
          <div className="col-span-2 flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-white/40 hover:text-white transition-colors">Cancelar</button>
            <button type="submit" disabled={isPending} className="flex items-center gap-2 px-4 py-2 bg-[#771FE3] text-white text-sm font-semibold rounded-lg hover:bg-[#6a1bcc] disabled:opacity-60 transition-colors">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Adicionar
            </button>
          </div>
        </form>
      )}

      {/* Services list */}
      {services.length === 0 ? (
        <p className="text-white/25 text-sm text-center py-4">Nenhum serviço cadastrado ainda.</p>
      ) : (
        <div className="space-y-3">
          {services.map((svc) => {
            const Icon = SERVICE_ICONS[svc.service_name] ?? Layers;
            return (
              <div key={svc.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${isPending ? "opacity-60" : ""} bg-black/20 border-white/5`}>
                <div className="p-2 rounded-lg bg-[#771FE3]/10 flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-[#8F68C1]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{svc.service_name}</p>
                  {svc.service_description && (
                    <p className="text-xs text-white/30 mt-0.5 truncate">{svc.service_description}</p>
                  )}
                  <div className="flex gap-1 mt-2">
                    {STATUS_OPTIONS.map(({ value, label, className }) => (
                      <button
                        key={value}
                        onClick={() => svc.service_status !== value && handleStatusChange(svc.id, value)}
                        disabled={isPending}
                        className={`text-xs px-2 py-0.5 rounded-lg border transition-all ${
                          svc.service_status === value ? className : "bg-white/5 text-white/20 border-white/5 hover:bg-white/10 hover:text-white/40"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => handleRemove(svc.id, svc.service_name)} disabled={isPending}
                  className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0 mt-0.5">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
