import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ClientSidebar } from "@/components/shared/ClientSidebar";
import { ViccariLogo } from "@/components/shared/ViccariLogo";

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

  // Read current pathname forwarded by middleware
  const headersList = headers();
  const pathname = headersList.get("x-pathname") ?? "";

  // Check briefing completion
  let briefingComplete = false;
  if (company) {
    const { data: briefing } = await supabase
      .from("briefing_answers")
      .select("current_step")
      .eq("company_id", company.id)
      .maybeSingle();
    briefingComplete = (briefing?.current_step ?? 0) >= 5;
  }

  // Gate: redirect all non-briefing routes until briefing is complete
  const isBriefingRoute = pathname === "/client/briefing";

  if (!briefingComplete && !isBriefingRoute) {
    redirect("/client/briefing");
  }

  // Full-screen ANIMA layout — shown during onboarding
  if (!briefingComplete) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col">
        {/* ANIMA top bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/5">
          <ViccariLogo variant="solid" size="sm" />
          <div className="text-right">
            <p
              className="font-bold text-[#771FE3] tracking-[0.25em]"
              style={{ fontSize: 18, fontFamily: "Raleway, sans-serif", fontWeight: 700 }}
            >
              ANIMA
            </p>
            <p className="text-white/30 text-xs" style={{ fontFamily: "Raleway, sans-serif" }}>
              documento vivo da sua marca
            </p>
          </div>
        </div>

        {/* Briefing content — centered, full width */}
        <div className="flex-1 flex justify-center py-10 px-4">
          <div className="w-full max-w-2xl">{children}</div>
        </div>

        <p className="text-center text-white/15 text-xs pb-6">
          © {new Date().getFullYear()} Viccari Ads Agency
        </p>
      </div>
    );
  }

  // Normal Hub layout — sidebar + content
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
