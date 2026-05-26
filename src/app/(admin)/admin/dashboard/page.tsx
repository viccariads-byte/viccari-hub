import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Users, Brain, ClipboardList, TrendingUp, ChevronRight, User } from "lucide-react";
import { NotificationsPanel } from "@/components/admin/NotificationsPanel";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalClients },
    { count: totalContents },
    { count: pendingBriefings },
    { count: totalBrandBrains },
    { data: recentClients },
    { data: notifications },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "client"),
    supabase
      .from("generated_contents")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("companies")
      .select("*", { count: "exact", head: true })
      .not("id", "in", `(select company_id from briefing_answers)`),
    supabase
      .from("brand_brain")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select(`id, email, full_name, created_at, companies(name)`)
      .eq("role", "client")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("admin_notifications")
      .select("id, message, module_type, read, created_at, company_id")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const stats = [
    {
      label: "Clientes Ativos",
      value: totalClients ?? 0,
      icon: Users,
      href: "/admin/clients",
      color: "from-[#771FE3] to-[#8F68C1]",
    },
    {
      label: "Conteúdos Gerados",
      value: totalContents ?? 0,
      icon: TrendingUp,
      href: null,
      color: "from-[#8F68C1] to-[#771FE3]",
    },
    {
      label: "Briefings Pendentes",
      value: pendingBriefings ?? 0,
      icon: ClipboardList,
      href: "/admin/clients",
      color: "from-[#771FE3] to-[#8F68C1]",
    },
    {
      label: "Brand Brains",
      value: totalBrandBrains ?? 0,
      icon: Brain,
      href: null,
      color: "from-[#8F68C1] to-[#771FE3]",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Painel Geral</h1>
        <p className="text-white/50 mt-1">
          Visão geral de todos os clientes e operações.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, href, color }) => {
          const card = (
            <div className={`bg-[#111111] border border-white/10 rounded-xl p-6 ${href ? "hover:border-[#771FE3]/30 cursor-pointer transition-all" : ""}`}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-white/50 text-sm font-medium">{label}</p>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{value}</p>
            </div>
          );
          return href ? (
            <Link key={label} href={href}>{card}</Link>
          ) : (
            <div key={label}>{card}</div>
          );
        })}
      </div>

      {/* Notifications */}
      {notifications && notifications.length > 0 && (
        <NotificationsPanel notifications={notifications} />
      )}

      {/* Recent clients */}
      <div className="bg-[#111111] border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Clientes Recentes</h2>
          <Link
            href="/admin/clients"
            className="text-sm text-[#8F68C1] hover:text-[#771FE3] flex items-center gap-1 transition-colors"
          >
            Ver todos
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentClients && recentClients.length > 0 ? (
          <div className="space-y-2">
            {recentClients.map((client) => {
              const company = (client.companies as { name: string }[] | null)?.[0];
              return (
                <Link
                  key={client.id}
                  href={`/admin/clients/${client.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#771FE3] to-[#8F68C1] flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {company?.name || "Sem empresa"}
                    </p>
                    <p className="text-xs text-white/40 truncate">
                      {(client as { full_name?: string }).full_name
                        ? `${(client as { full_name?: string }).full_name} · ${client.email}`
                        : client.email}
                    </p>
                  </div>
                  <span className="text-xs text-white/30">
                    {new Date(client.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-[#771FE3] transition-colors flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-white/30">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum cliente cadastrado.</p>
            <Link
              href="/admin/clients/new"
              className="inline-flex items-center gap-1.5 mt-4 text-sm text-[#771FE3] hover:text-[#8F68C1] transition-colors"
            >
              Criar primeiro cliente →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
