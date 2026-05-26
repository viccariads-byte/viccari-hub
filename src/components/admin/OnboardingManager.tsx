"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Circle,
  AlertCircle,
  ChevronDown,
  Save,
  Calendar,
} from "lucide-react";
import { OnboardingPhase, OnboardingStatus } from "@/lib/types/database";
import { updateOnboardingPhase } from "@/lib/actions/onboarding";
import { toast } from "sonner";

const STATUS_OPTIONS: { value: OnboardingStatus; label: string }[] = [
  { value: "pendente", label: "Pendente" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "aguardando_cliente", label: "Aguardando cliente" },
  { value: "concluido", label: "Concluído" },
];

const statusConfig = {
  pendente: {
    icon: Circle,
    color: "text-white/30",
    badge: "bg-white/5 text-white/30 border-white/10",
  },
  em_andamento: {
    icon: Clock,
    color: "text-[#771FE3]",
    badge: "bg-[#771FE3]/15 text-[#8F68C1] border-[#771FE3]/20",
  },
  aguardando_cliente: {
    icon: AlertCircle,
    color: "text-amber-400",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  },
  concluido: {
    icon: CheckCircle2,
    color: "text-green-400",
    badge: "bg-green-500/15 text-green-400 border-green-500/20",
  },
};

interface OnboardingManagerProps {
  phases: OnboardingPhase[];
  companyUserId: string;
  completedCount: number;
}

export function OnboardingManager({
  phases,
  companyUserId,
  completedCount,
}: OnboardingManagerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  // Local editable state per phase
  const [edits, setEdits] = useState<
    Record<string, { status: OnboardingStatus; notes: string; deadline: string }>
  >(
    Object.fromEntries(
      phases.map((p) => [
        p.id,
        {
          status: p.status,
          notes: p.notes ?? "",
          deadline: p.deadline ? p.deadline.slice(0, 10) : "",
        },
      ])
    )
  );

  function setField(
    id: string,
    field: "status" | "notes" | "deadline",
    value: string
  ) {
    setEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  }

  async function handleSave(phase: OnboardingPhase) {
    const edit = edits[phase.id];
    setSaving(phase.id);
    try {
      const result = await updateOnboardingPhase(phase.id, companyUserId, {
        status: edit.status,
        notes: edit.notes,
        deadline: edit.deadline,
      });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Fase ${phase.phase_number} atualizada.`);
        setExpandedId(null);
      }
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(null);
    }
  }

  const total = phases.length;

  return (
    <div className="bg-[#111111] border border-white/10 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
          Onboarding
        </h2>
        <span className="text-xs text-white/40">
          {completedCount}/{total} concluídas
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/10 rounded-full mb-5">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-[#771FE3] to-[#8F68C1] transition-all duration-500"
          style={{ width: `${total > 0 ? (completedCount / total) * 100 : 0}%` }}
        />
      </div>

      {/* Phases */}
      <div className="space-y-2">
        {phases.map((phase) => {
          const edit = edits[phase.id];
          const config = statusConfig[edit.status] ?? statusConfig.pendente;
          const Icon = config.icon;
          const isOpen = expandedId === phase.id;

          return (
            <div
              key={phase.id}
              className="border border-white/5 rounded-lg overflow-hidden"
            >
              {/* Phase row — click to expand */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors text-left"
                onClick={() => setExpandedId(isOpen ? null : phase.id)}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${config.color}`} />
                <span
                  className={`text-sm flex-1 ${
                    edit.status === "concluido"
                      ? "text-white/40 line-through"
                      : "text-white"
                  }`}
                >
                  Fase {phase.phase_number} — {phase.phase_name}
                </span>
                {edit.deadline && (
                  <span className="flex items-center gap-1 text-xs text-white/30">
                    <Calendar className="w-3 h-3" />
                    {new Date(edit.deadline + "T00:00:00").toLocaleDateString("pt-BR")}
                  </span>
                )}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${config.badge}`}
                >
                  {STATUS_OPTIONS.find((s) => s.value === edit.status)?.label}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-white/30 transition-transform flex-shrink-0 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Expanded editor */}
              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-white/5 bg-black/10">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {/* Status select */}
                    <div>
                      <label className="block text-xs text-white/40 mb-1">
                        Status
                      </label>
                      <select
                        value={edit.status}
                        onChange={(e) =>
                          setField(
                            phase.id,
                            "status",
                            e.target.value as OnboardingStatus
                          )
                        }
                        className="w-full bg-[#000000] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#771FE3]/50"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Deadline */}
                    <div>
                      <label className="block text-xs text-white/40 mb-1">
                        Prazo
                      </label>
                      <input
                        type="date"
                        value={edit.deadline}
                        onChange={(e) =>
                          setField(phase.id, "deadline", e.target.value)
                        }
                        className="w-full bg-[#000000] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#771FE3]/50 [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-3">
                    <label className="block text-xs text-white/40 mb-1">
                      Notas internas
                    </label>
                    <textarea
                      value={edit.notes}
                      onChange={(e) =>
                        setField(phase.id, "notes", e.target.value)
                      }
                      rows={2}
                      placeholder="Observações sobre esta fase..."
                      className="w-full bg-[#000000] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#771FE3]/50 resize-none"
                    />
                  </div>

                  <button
                    onClick={() => handleSave(phase)}
                    disabled={saving === phase.id}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#771FE3] hover:bg-[#771FE3]/80 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saving === phase.id ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
