import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  AtSign,
  Brain,
  ClipboardList,
  FileText,
  Video,
  LayoutGrid,
  ImageIcon,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { DeleteClientButton } from "@/components/admin/DeleteClientButton";
import { BrandBrainPanel } from "@/components/admin/BrandBrainPanel";
import { OnboardingManager } from "@/components/admin/OnboardingManager";
import { ModulesManager } from "@/components/admin/ModulesManager";
import { LogoUploader } from "@/components/admin/LogoUploader";
import { TeamManager } from "@/components/admin/TeamManager";
import { ServicesManager } from "@/components/admin/ServicesManager";
import { BrandBrain, OnboardingPhase } from "@/lib/types/database";

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Fetch profile from auth
  const { data: { user: authUser } } = await adminClient.auth.admin.getUserById(params.id);
  if (!authUser) notFound();

  // Fetch profile + company + related data
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, created_at, role")
    .eq("id", params.id)
    .single();

  if (!profile || profile.role !== "client") notFound();

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", params.id)
    .single();

  const [
    { data: briefing },
    { data: brandBrain },
    { data: onboardingPhases },
    { data: contents },
    { data: moduleSubmissions },
    { data: playbook },
    { data: teamMembers },
    { data: services },
  ] = await Promise.all([
    supabase
      .from("briefing_answers")
      .select("id, created_at, briefing_data, current_step")
      .eq("company_id", company?.id ?? "")
      .maybeSingle(),
    supabase
      .from("brand_brain")
      .select("*")
      .eq("company_id", company?.id ?? "")
      .maybeSingle(),
    supabase
      .from("onboarding_phases")
      .select("*")
      .eq("company_id", company?.id ?? "")
      .order("phase_number"),
    supabase
      .from("generated_contents")
      .select("id, title, format, pillar, status, scheduled_date, created_at")
      .eq("company_id", company?.id ?? "")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("module_submissions")
      .select("module_type, status, current_step, submitted_at, form_data")
      .eq("company_id", company?.id ?? ""),
    supabase
      .from("playbooks")
      .select("id")
      .eq("company_id", company?.id ?? "")
      .maybeSingle(),
    supabase
      .from("company_team")
      .select("id, member_name, member_role, member_photo_url, member_whatsapp, member_email")
      .eq("company_id", company?.id ?? "")
      .order("created_at"),
    supabase
      .from("company_services")
      .select("id, service_name, service_status, service_description")
      .eq("company_id", company?.id ?? "")
      .order("created_at"),
  ]);

  const contentCount = contents?.length ?? 0;
  const completedPhases =
    onboardingPhases?.filter((p) => p.status === "concluido").length ?? 0;
  const totalPhases = onboardingPhases?.length ?? 6;

  return (
    <div className="max-w-4xl">
      {/* Back */}
      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Clientes
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          {company ? (
            <LogoUploader
              companyId={company.id}
              currentLogoUrl={(company as { logo_url?: string | null }).logo_url}
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#771FE3] to-[#8F68C1] flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">
              {company?.name || "Empresa não cadastrada"}
            </h1>
            {profile.full_name && (
              <p className="text-white/60 text-sm font-medium">{profile.full_name}</p>
            )}
            <p className="text-white/40 text-sm mt-0.5">{profile.email}</p>
          </div>
        </div>
        <DeleteClientButton userId={params.id} clientName={company?.name ?? profile.email} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Status cards */}
        <StatusCard
          icon={FileText}
          label="Briefing"
          status={briefing ? "Preenchido" : "Pendente"}
          statusOk={!!briefing}
          detail={briefing ? `Enviado em ${new Date(briefing.created_at).toLocaleDateString("pt-BR")}` : "Aguardando preenchimento"}
        />
        <StatusCard
          icon={Brain}
          label="Brand Brain"
          status={brandBrain ? "Gerado" : "Não gerado"}
          statusOk={!!brandBrain}
          detail={brandBrain ? `Atualizado em ${new Date(brandBrain.updated_at).toLocaleDateString("pt-BR")}` : "Gerar após briefing"}
        />
        <StatusCard
          icon={ClipboardList}
          label="Conteúdos"
          status={`${contentCount} gerados`}
          statusOk={contentCount > 0}
          detail={`${completedPhases}/${totalPhases} fases concluídas`}
        />
      </div>

      {/* Brand Brain */}
      {company && (
        <div className="mb-4">
          <BrandBrainPanel
            companyId={company.id}
            brandBrain={brandBrain as BrandBrain | null}
          />
        </div>
      )}

      {/* Company info */}
      {company && (company.instagram || company.phone || company.city || company.email) && (
        <div className="bg-[#111111] border border-white/10 rounded-xl p-6 mb-4">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
            Dados da Empresa
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {company.instagram && (
              <InfoRow icon={AtSign} label="Instagram" value={company.instagram} />
            )}
            {company.email && (
              <InfoRow icon={Mail} label="E-mail" value={company.email} />
            )}
            {company.phone && (
              <InfoRow icon={Phone} label="Telefone" value={company.phone} />
            )}
            {company.city && (
              <InfoRow icon={MapPin} label="Cidade" value={`${company.city}${company.coverage ? ` — ${company.coverage}` : ""}`} />
            )}
          </div>
        </div>
      )}

      {/* Modules */}
      {company && (
        <div className="mb-4">
          <ModulesManager
            companyId={company.id}
            modulesEnabled={(company.modules_enabled as Record<string, boolean>) ?? {}}
            submissions={(moduleSubmissions ?? []) as { module_type: string; status: string; current_step: number; submitted_at: string | null; form_data: Record<string, unknown> }[]}
            playbookGenerated={!!playbook}
          />
        </div>
      )}

      {/* Briefing viewer */}
      {briefing?.briefing_data && (
        <div className="mb-4">
          <BriefingViewer
            data={briefing.briefing_data as Record<string, unknown>}
            step={briefing.current_step ?? 1}
          />
        </div>
      )}

      {/* Onboarding — interactive manager */}
      {onboardingPhases && (
        <OnboardingManager
          phases={onboardingPhases as OnboardingPhase[]}
          companyUserId={params.id}
          completedCount={completedPhases}
        />
      )}

      {/* Team + Services */}
      {company && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <TeamManager
            companyId={company.id}
            members={teamMembers ?? []}
          />
          <ServicesManager
            companyId={company.id}
            services={services ?? []}
          />
        </div>
      )}

      {/* Content list */}
      {contents && contents.length > 0 && (
        <ContentListAdmin contents={contents} />
      )}
    </div>
  );
}

function StatusCard({
  icon: Icon,
  label,
  status,
  statusOk,
  detail,
}: {
  icon: React.ElementType;
  label: string;
  status: string;
  statusOk: boolean;
  detail: string;
}) {
  return (
    <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-white/40" />
        <span className="text-xs text-white/40 font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className={`font-semibold text-sm ${statusOk ? "text-white" : "text-white/40"}`}>
        {status}
      </p>
      <p className="text-xs text-white/30 mt-0.5">{detail}</p>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-3.5 h-3.5 text-white/30 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-white/30">{label}</p>
        <p className="text-sm text-white">{value}</p>
      </div>
    </div>
  );
}

type ContentRow = {
  id: string;
  title: string | null;
  format: string;
  pillar: string;
  status: string;
  scheduled_date: string | null;
  created_at: string;
};

const FORMAT_ICONS_ADMIN: Record<string, React.ElementType> = {
  reels: Video,
  feed: LayoutGrid,
  stories: ImageIcon,
};
const FORMAT_LABELS_ADMIN: Record<string, string> = {
  reels: "Reels",
  feed: "Carrossel",
  stories: "Stories",
};
const STATUS_CONFIG_ADMIN: Record<string, { label: string; icon: React.ElementType; badge: string }> = {
  gerado: { label: "Aguardando", icon: Clock, badge: "bg-white/5 text-white/40 border-white/10" },
  aprovado: { label: "Aprovado", icon: CheckCircle2, badge: "bg-green-500/15 text-green-400 border-green-500/20" },
  reprovado: { label: "Reprovado", icon: XCircle, badge: "bg-red-500/15 text-red-400 border-red-500/20" },
};

const BRIEFING_SECTIONS = [
  {
    title: "Operacional",
    fields: [
      { key: "nome_empresa", label: "Empresa" },
      { key: "instagram", label: "Instagram" },
      { key: "segmento", label: "Segmento" },
      { key: "cidade", label: "Cidade" },
      { key: "contato", label: "Contato" },
      { key: "site", label: "Site" },
      { key: "redes_sociais", label: "Redes Sociais", array: true },
    ],
  },
  {
    title: "Público e Concorrência",
    fields: [
      { key: "persona_principal", label: "Persona Principal" },
      { key: "dores", label: "Dores" },
      { key: "desejos", label: "Desejos" },
      { key: "objecoes_compra", label: "Objeções de Compra" },
      { key: "concorrentes", label: "Concorrentes" },
      { key: "diferenciais_concorrencia", label: "Diferenciais" },
    ],
  },
  {
    title: "Ofertas e Metas",
    fields: [
      { key: "produtos_servicos", label: "Produtos / Serviços" },
      { key: "ticket_medio", label: "Ticket Médio" },
      { key: "produto_foco", label: "Produto Foco" },
      { key: "sazonalidade", label: "Sazonalidade" },
      { key: "meses_fortes", label: "Meses Fortes", array: true },
      { key: "meses_fracos", label: "Meses Fracos", array: true },
      { key: "datas_importantes", label: "Datas Importantes" },
    ],
  },
  {
    title: "Identidade e Voz",
    fields: [
      { key: "tom_de_voz", label: "Tom de Voz" },
      { key: "palavras_marca", label: "Palavras da Marca" },
      { key: "evitar", label: "O que Evitar" },
      { key: "frases_tipicas", label: "Frases Típicas" },
      { key: "cores", label: "Cores" },
      { key: "fonte", label: "Fonte" },
      { key: "estilo_visual", label: "Estilo Visual" },
      { key: "referencias_instagram", label: "Referências Instagram" },
    ],
  },
  {
    title: "Alma da Marca",
    fields: [
      { key: "frase_elevador", label: "Frase de Elevador" },
      { key: "o_que_torna_unica", label: "O que Torna Única" },
      { key: "metodo_exclusivo", label: "Método Exclusivo" },
      { key: "arquetipo_marca", label: "Arquétipo" },
      { key: "posicionamento_emocional", label: "Posicionamento Emocional" },
      { key: "territorios_conteudo", label: "Territórios de Conteúdo" },
      { key: "pilares_editoriais", label: "Pilares Editoriais", array: true },
      { key: "temas_proibidos", label: "Temas Proibidos" },
    ],
  },
];

function BriefingViewer({
  data,
  step,
}: {
  data: Record<string, unknown>;
  step: number;
}) {
  const filledSections = BRIEFING_SECTIONS.filter((section) =>
    section.fields.some((f) => {
      const v = data[f.key];
      return f.array ? (v as string[] | undefined)?.length : !!v;
    })
  );

  if (filledSections.length === 0) return null;

  return (
    <div className="bg-[#111111] border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#8F68C1]" />
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Briefing Preenchido
          </h2>
        </div>
        <span className="text-xs text-white/30">Etapa {step} de 5</span>
      </div>

      <div className="space-y-6">
        {filledSections.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-semibold text-[#8F68C1] uppercase tracking-wider mb-3">
              {section.title}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              {section.fields.map((f) => {
                const v = data[f.key];
                if (!v) return null;
                if (f.array) {
                  const arr = v as string[];
                  if (!arr.length) return null;
                  return (
                    <div key={f.key} className="md:col-span-2">
                      <p className="text-xs text-white/30 mb-1">{f.label}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {arr.map((item, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded-full bg-[#771FE3]/10 text-[#8F68C1] border border-[#771FE3]/20"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={f.key}>
                    <p className="text-xs text-white/30 mb-0.5">{f.label}</p>
                    <p className="text-sm text-white leading-relaxed">{v as string}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentListAdmin({ contents }: { contents: ContentRow[] }) {
  const gerado = contents.filter((c) => c.status === "gerado").length;
  const aprovado = contents.filter((c) => c.status === "aprovado").length;
  const reprovado = contents.filter((c) => c.status === "reprovado").length;

  return (
    <div className="bg-[#111111] border border-white/10 rounded-xl p-6 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
          Conteúdos Recentes
        </h2>
        <div className="flex items-center gap-3 text-xs text-white/30">
          {aprovado > 0 && <span className="text-green-400">{aprovado} aprovados</span>}
          {reprovado > 0 && <span className="text-red-400">{reprovado} reprovados</span>}
          {gerado > 0 && <span>{gerado} aguardando</span>}
        </div>
      </div>

      <div className="space-y-2">
        {contents.map((c) => {
          const FmtIcon = FORMAT_ICONS_ADMIN[c.format] ?? FileText;
          const cfg = STATUS_CONFIG_ADMIN[c.status] ?? STATUS_CONFIG_ADMIN.gerado;
          const StatusIcon = cfg.icon;
          return (
            <div
              key={c.id}
              className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0"
            >
              <div className="w-7 h-7 rounded-md bg-[#771FE3]/10 flex items-center justify-center flex-shrink-0">
                <FmtIcon className="w-3.5 h-3.5 text-[#8F68C1]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{c.title ?? c.pillar}</p>
                <p className="text-xs text-white/30">
                  {FORMAT_LABELS_ADMIN[c.format]} · {c.pillar}
                </p>
              </div>
              {c.scheduled_date && (
                <span className="text-xs text-white/25 flex-shrink-0">
                  {new Date(c.scheduled_date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                </span>
              )}
              <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${cfg.badge}`}>
                <StatusIcon className="w-3 h-3" />
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
