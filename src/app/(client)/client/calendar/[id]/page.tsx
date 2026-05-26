import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Video,
  LayoutGrid,
  ImageIcon,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { ContentFormat, ContentStatus } from "@/lib/types/database";
import { ContentActions } from "@/components/client/ContentActions";

const FORMAT_ICONS: Record<ContentFormat, React.ElementType> = {
  reels: Video,
  feed: LayoutGrid,
  stories: ImageIcon,
};

const FORMAT_LABELS: Record<ContentFormat, string> = {
  reels: "Reels",
  feed: "Feed / Carrossel",
  stories: "Stories",
};

const STATUS_CONFIG: Record<
  ContentStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  gerado: { label: "Aguardando aprovação", icon: Clock, className: "bg-white/5 text-white/40 border-white/10" },
  aprovado: { label: "Aprovado", icon: CheckCircle2, className: "bg-green-500/15 text-green-400 border-green-500/20" },
  reprovado: { label: "Reprovado", icon: XCircle, className: "bg-red-500/15 text-red-400 border-red-500/20" },
};

const SECTION_LABELS: Record<string, string> = {
  hook: "Hook de abertura",
  structure: "Estrutura",
  script: "Roteiro / Texto",
  caption: "Legenda",
  cta: "Call to Action",
};

export default async function ContentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("user_id", user.id)
    .single();

  if (!company) redirect("/client/dashboard");

  const { data: content } = await supabase
    .from("generated_contents")
    .select("*")
    .eq("id", params.id)
    .eq("company_id", company.id)
    .single();

  if (!content) notFound();

  const FormatIcon = FORMAT_ICONS[content.format as ContentFormat] ?? Video;
  const statusCfg = STATUS_CONFIG[content.status as ContentStatus] ?? STATUS_CONFIG.gerado;
  const StatusIcon = statusCfg.icon;

  return (
    <div className="max-w-2xl">
      {/* Back */}
      <Link
        href="/client/calendar"
        className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors no-print"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao Calendário
      </Link>

      {/* Header */}
      <div className="bg-[#111111] border border-white/10 rounded-xl p-6 mb-5 no-print">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#771FE3]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FormatIcon className="w-5 h-5 text-[#8F68C1]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white mb-1">
                {content.title ?? content.pillar}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#771FE3]/10 text-[#8F68C1] border border-[#771FE3]/20">
                  {FORMAT_LABELS[content.format as ContentFormat]}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
                  {content.pillar}
                </span>
                {content.scheduled_date && (
                  <span className="flex items-center gap-1 text-xs text-white/30">
                    <Calendar className="w-3 h-3" />
                    {new Date(content.scheduled_date + "T00:00:00").toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border flex-shrink-0 ${statusCfg.className}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {statusCfg.label}
          </span>
        </div>

        {content.status === "reprovado" && content.client_notes && (
          <div className="mt-4 p-3 bg-red-500/5 border border-red-500/15 rounded-lg">
            <p className="text-xs text-red-400/80 font-medium mb-0.5">Motivo da reprovação:</p>
            <p className="text-xs text-red-400/60">{content.client_notes}</p>
          </div>
        )}
      </div>

      {/* Content sections */}
      <div className="space-y-4 mb-6 no-print">
        {(["hook", "structure", "script", "caption", "cta"] as const).map((field) => {
          const value = content[field as keyof typeof content] as string | null;
          if (!value) return null;
          return (
            <div key={field} className="bg-[#111111] border border-white/10 rounded-xl p-5">
              <p className="text-xs font-semibold text-[#8F68C1] uppercase tracking-wider mb-3">
                {SECTION_LABELS[field]}
              </p>
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">{value}</p>
            </div>
          );
        })}
      </div>

      {/* Approval + Export actions */}
      <div className="no-print">
        <ContentActions
          contentId={content.id}
          initialStatus={content.status as ContentStatus}
          initialNotes={content.client_notes}
          printData={{
            companyName: company.name ?? "",
            title: content.title,
            format: content.format as ContentFormat,
            pillar: content.pillar,
            scheduledDate: content.scheduled_date,
            hook: content.hook,
            structure: content.structure,
            script: content.script,
            caption: content.caption,
            cta: content.cta,
          }}
        />
      </div>
    </div>
  );
}
