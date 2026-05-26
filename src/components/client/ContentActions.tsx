"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Download, RotateCcw } from "lucide-react";
import { ContentFormat, ContentStatus } from "@/lib/types/database";
import { updateContentStatus } from "@/lib/actions/content";
import { toast } from "sonner";

const FORMAT_LABELS: Record<ContentFormat, string> = {
  reels: "Reels",
  feed: "Feed / Carrossel",
  stories: "Stories",
};

const SECTION_LABELS: Record<string, string> = {
  hook: "Hook de Abertura",
  structure: "Estrutura",
  script: "Roteiro / Texto",
  caption: "Legenda",
  cta: "Call to Action",
};

export interface PrintData {
  companyName: string;
  title: string | null;
  format: ContentFormat;
  pillar: string;
  scheduledDate: string | null;
  hook: string | null;
  structure: string | null;
  script: string | null;
  caption: string | null;
  cta: string | null;
}

interface ContentActionsProps {
  contentId: string;
  initialStatus: ContentStatus;
  initialNotes: string | null;
  printData: PrintData;
}

export function ContentActions({
  contentId,
  initialStatus,
  initialNotes,
  printData,
}: ContentActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState<ContentStatus>(initialStatus);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleApprove() {
    setSaving(true);
    const result = await updateContentStatus(contentId, "aprovado");
    if (result.error) {
      toast.error(result.error);
    } else {
      setStatus("aprovado");
      setNotes("");
      toast.success("Conteúdo aprovado!");
      router.refresh();
    }
    setSaving(false);
  }

  async function handleReject() {
    if (!notes.trim()) {
      toast.error("Informe o motivo da reprovação.");
      return;
    }
    setSaving(true);
    const result = await updateContentStatus(contentId, "reprovado", notes);
    if (result.error) {
      toast.error(result.error);
    } else {
      setStatus("reprovado");
      setShowRejectForm(false);
      toast.success("Conteúdo reprovado.");
      router.refresh();
    }
    setSaving(false);
  }

  async function handleUndo() {
    setSaving(true);
    const result = await updateContentStatus(contentId, "gerado", undefined);
    if (result.error) {
      toast.error(result.error);
    } else {
      setStatus("gerado");
      setNotes("");
      router.refresh();
    }
    setSaving(false);
  }

  function handleExport() {
    window.print();
  }

  const today = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      {/* ── Visible action bar ── */}
      <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
        {status === "gerado" && !showRejectForm && (
          <div>
            <p className="text-sm font-medium text-white mb-3">
              O que deseja fazer com este conteúdo?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500/10 border border-green-500/25 text-green-400 hover:bg-green-500/20 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Aprovar
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Reprovar
              </button>
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 rounded-xl text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
            </div>
          </div>
        )}

        {status === "gerado" && showRejectForm && (
          <div>
            <p className="text-sm font-medium text-white mb-2">
              Motivo da reprovação
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Descreva o que precisa ser ajustado..."
              className="w-full bg-[#000000] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-red-400/40 resize-none mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={handleReject}
                disabled={saving || !notes.trim()}
                className="flex-1 py-2.5 bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Confirmar Reprovação"}
              </button>
              <button
                onClick={() => { setShowRejectForm(false); setNotes(""); }}
                className="px-4 py-2.5 border border-white/10 text-white/40 hover:text-white rounded-xl text-sm transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {status === "aprovado" && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400 font-medium">Conteúdo aprovado</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-white/50 hover:text-white rounded-lg text-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar PDF
              </button>
              <button
                onClick={handleUndo}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 text-white/30 hover:text-white/50 rounded-lg text-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Desfazer
              </button>
            </div>
          </div>
        )}

        {status === "reprovado" && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400 font-medium">Conteúdo reprovado</span>
            </div>
            <button
              onClick={handleUndo}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-white/30 hover:text-white/50 rounded-lg text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Desfazer
            </button>
          </div>
        )}
      </div>

      {/* ── Print-only section (hidden on screen, visible when printing) ── */}
      <div className="print-section">
        {/* Header */}
        <div style={{ borderBottom: "2px solid #771FE3", marginBottom: "28px", paddingBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <p style={{ fontFamily: "sans-serif", fontSize: "18px", fontWeight: "900", color: "#000000", letterSpacing: "3px", marginBottom: "2px" }}>
              VICCARI ADS AGENCY
            </p>
            <p style={{ fontFamily: "sans-serif", fontSize: "11px", color: "#8F68C1", letterSpacing: "1px" }}>
              Roteiro de Conteúdo · {printData.companyName}
            </p>
          </div>
          <p style={{ fontFamily: "sans-serif", fontSize: "11px", color: "#999" }}>{today}</p>
        </div>

        {/* Content metadata */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontFamily: "sans-serif", fontSize: "20px", fontWeight: "700", color: "#000000", marginBottom: "8px" }}>
            {printData.title ?? printData.pillar}
          </h1>
          <div style={{ display: "flex", gap: "8px" }}>
            <span style={{ background: "#771FE3", color: "white", padding: "3px 12px", borderRadius: "20px", fontSize: "11px", fontFamily: "sans-serif" }}>
              {FORMAT_LABELS[printData.format]}
            </span>
            <span style={{ background: "#f0ecf9", color: "#771FE3", padding: "3px 12px", borderRadius: "20px", fontSize: "11px", fontFamily: "sans-serif" }}>
              {printData.pillar}
            </span>
            {printData.scheduledDate && (
              <span style={{ background: "#f5f5f5", color: "#555", padding: "3px 12px", borderRadius: "20px", fontSize: "11px", fontFamily: "sans-serif" }}>
                {new Date(printData.scheduledDate + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
              </span>
            )}
          </div>
        </div>

        {/* Content fields */}
        {(["hook", "structure", "script", "caption", "cta"] as const).map((field) => {
          const value = printData[field];
          if (!value) return null;
          return (
            <div key={field} style={{ marginBottom: "20px", paddingLeft: "12px", borderLeft: "3px solid #771FE3" }}>
              <p style={{ fontFamily: "sans-serif", fontSize: "10px", fontWeight: "700", color: "#771FE3", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "6px" }}>
                {SECTION_LABELS[field]}
              </p>
              <p style={{ fontFamily: "sans-serif", fontSize: "12px", color: "#333", lineHeight: "1.7", whiteSpace: "pre-line" }}>
                {value}
              </p>
            </div>
          );
        })}

        {/* Footer */}
        <div style={{ borderTop: "1px solid #eee", marginTop: "32px", paddingTop: "12px", textAlign: "center" }}>
          <p style={{ fontFamily: "sans-serif", fontSize: "10px", color: "#bbb" }}>
            Gerado por Viccari Hub · viccari.marketing@gmail.com
          </p>
        </div>
      </div>
    </>
  );
}
