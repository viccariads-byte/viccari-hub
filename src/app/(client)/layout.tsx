import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientSidebar } from "@/components/shared/ClientSidebar";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: company }] = await Promise.all([
    supabase.from("profiles").select("role, email, full_name").eq("id", user.id).single(),
    supabase.from("companies").select("id, modules_enabled, logo_url, crm_url, support_url").eq("user_id", user.id).maybeSingle(),
  ]);

  if (!profile) redirect("/login");
  if (profile.role !== "client") redirect("/login");

  // Gate: redirect to ANIMA setup if briefing not complete
  if (company) {
    const { data: briefing } = await supabase
      .from("briefing_answers")
      .select("current_step")
      .eq("company_id", company.id)
      .maybeSingle();

    const briefingComplete = (briefing?.current_step ?? 0) >= 5;
    if (!briefingComplete) redirect("/setup");
  } else {
    // No company set up yet — redirect to setup so client waits there
    redirect("/setup");
  }

  const modulesEnabled = (company?.modules_enabled as Record<string, boolean>) ?? {};
  const c = company as {
    logo_url?: string | null;
    crm_url?: string | null;
    support_url?: string | null;
  } | null;

  return (
    <div className="flex min-h-screen bg-[#000000]">
      <ClientSidebar
        email={profile?.email ?? user.email ?? ""}
        fullName={profile?.full_name ?? null}
        modulesEnabled={modulesEnabled}
        clientLogoUrl={c?.logo_url ?? null}
        crmUrl={c?.crm_url ?? null}
        supportUrl={c?.support_url ?? null}
      />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
