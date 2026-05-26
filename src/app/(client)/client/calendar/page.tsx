"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Calendar,
  Video,
  LayoutGrid,
  ImageIcon,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { ContentFormat, ContentStatus, GeneratedContent } from "@/lib/types/database";
import { generateMonthlyCalendar } from "@/lib/actions/content";
import { toast } from "sonner";

const FORMAT_ICONS: Record<ContentFormat, React.ElementType> = {
  reels: Video,
  feed: LayoutGrid,
  stories: ImageIcon,
};

const FORMAT_LABELS: Record<ContentFormat, string> = {
  reels: "Reels",
  feed: "Carrossel",
  stories: "Stories",
};

const STATUS_CONFIG: Record<ContentStatus, { label: string; className: string }> = {
  gerado: { label: "Gerado", className: "bg-white/5 text-white/40 border-white/10" },
  aprovado: { label: "Aprovado", className: "bg-green-500/15 text-green-400 border-green-500/20" },
  reprovado: { label: "Reprovado", className: "bg-red-500/15 text-red-400 border-red-500/20" },
};

const STATUS_ICONS: Record<ContentStatus, React.ElementType> = {
  gerado: Clock,
  aprovado: CheckCircle2,
  reprovado: XCircle,
};

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function CalendarPage() {
  const [contents, setContents] = useState<GeneratedContent[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;

  const fetchContents = useCallback(async (cId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("generated_contents")
      .select("*")
      .eq("company_id", cId)
      .order("scheduled_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    setContents((data as GeneratedContent[]) ?? []);
  }, []);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!company) return;
      setCompanyId(company.id);
      await fetchContents(company.id);
      setLoading(false);
    }
    init();
  }, [fetchContents]);

  async function handleGenerateCalendar() {
    if (!companyId) return;
    setGenerating(true);
    try {
      const result = await generateMonthlyCalendar(companyId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${result.count} conteúdos gerados para o mês!`);
        await fetchContents(companyId);
      }
    } catch {
      toast.error("Erro ao gerar o calendário.");
    } finally {
      setGenerating(false);
    }
  }

  // Group by month/year
  const grouped: Record<string, GeneratedContent[]> = {};
  for (const c of contents) {
    const key = c.scheduled_date
      ? c.scheduled_date.slice(0, 7) // "YYYY-MM"
      : "sem-data";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  }

  const sortedKeys = Object.keys(grouped).sort((a, b) =>
    a === "sem-data" ? 1 : b === "sem-data" ? -1 : a.localeCompare(b)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#771FE3] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#771FE3] to-[#8F68C1]">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Calendário de Conteúdo</h1>
          </div>
          <p className="text-white/40 text-sm">
            {contents.length} conteúdo{contents.length !== 1 ? "s" : ""} no histórico
          </p>
        </div>

        <button
          onClick={handleGenerateCalendar}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#771FE3] to-[#8F68C1] hover:opacity-90 text-white text-sm font-semibold rounded-xl transition-opacity disabled:opacity-60 flex-shrink-0"
        >
          <Sparkles className={`w-4 h-4 ${generating ? "animate-pulse" : ""}`} />
          {generating ? "Gerando..." : `Gerar ${MONTH_NAMES[currentMonth - 1]}`}
        </button>
      </div>

      {generating && (
        <div className="bg-[#111111] border border-[#771FE3]/20 rounded-xl p-4 mb-6 flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-[#771FE3] animate-spin flex-shrink-0" />
          <p className="text-sm text-white/60">
            Gerando 10 conteúdos personalizados... isso pode levar até 1 minuto.
          </p>
        </div>
      )}

      {contents.length === 0 ? (
        <div className="bg-[#111111] border border-white/10 rounded-xl p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-[#771FE3]/10 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-7 h-7 text-[#771FE3]/50" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Nenhum conteúdo ainda</h2>
          <p className="text-white/40 text-sm max-w-xs mx-auto">
            Clique em &quot;Gerar {MONTH_NAMES[currentMonth - 1]}&quot; para criar seu calendário completo,
            ou gere conteúdos sob demanda na página &quot;Gerar Conteúdo&quot;.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedKeys.map((key) => {
            const items = grouped[key];
            let monthLabel = "Sem data";
            if (key !== "sem-data") {
              const [y, m] = key.split("-");
              monthLabel = `${MONTH_NAMES[parseInt(m) - 1]} ${y}`;
            }

            const approved = items.filter((c) => c.status === "aprovado").length;
            const rejected = items.filter((c) => c.status === "reprovado").length;

            return (
              <div key={key}>
                {/* Month header */}
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                    {monthLabel}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-white/30">
                    <span>{items.length} conteúdos</span>
                    {approved > 0 && (
                      <span className="text-green-400">{approved} aprovados</span>
                    )}
                    {rejected > 0 && (
                      <span className="text-red-400">{rejected} reprovados</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {items.map((content) => {
                    const FormatIcon = FORMAT_ICONS[content.format];
                    const statusCfg = STATUS_CONFIG[content.status];
                    const StatusIcon = STATUS_ICONS[content.status];

                    return (
                      <Link
                        key={content.id}
                        href={`/client/calendar/${content.id}`}
                        className="flex items-center gap-4 bg-[#111111] border border-white/5 hover:border-white/15 rounded-xl p-4 transition-all group"
                      >
                        {/* Format icon */}
                        <div className="w-9 h-9 rounded-lg bg-[#771FE3]/10 flex items-center justify-center flex-shrink-0">
                          <FormatIcon className="w-4 h-4 text-[#8F68C1]" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {content.title ?? content.pillar}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-white/30">
                              {FORMAT_LABELS[content.format]}
                            </span>
                            <span className="text-white/20 text-xs">·</span>
                            <span className="text-xs text-white/30">{content.pillar}</span>
                            {content.scheduled_date && (
                              <>
                                <span className="text-white/20 text-xs">·</span>
                                <span className="text-xs text-white/30">
                                  {new Date(content.scheduled_date + "T00:00:00").toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "short",
                                  })}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2">
                          <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${statusCfg.className}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusCfg.label}
                          </span>
                          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
