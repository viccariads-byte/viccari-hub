import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientSidebar } from "@/components/shared/ClientSidebar";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: company }] = await Promise.all([
    supabase.from("profiles").select("role, email, full_name").eq("id", user.id).single(),
    supabase.from("companies").select("modules_enabled, logo_url").eq("user_id", user.id).maybeSingle(),
  ]);

  if (!profile) redirect("/login");
  if (profile.role !== "client") redirect("/login");

  const modulesEnabled = (company?.modules_enabled as Record<string, boolean>) ?? {};
  const clientLogoUrl = (company as { logo_url?: string | null } | null)?.logo_url ?? null;

  return (
    <div className="flex min-h-screen bg-[#000000]">
      <ClientSidebar
        email={profile?.email ?? user.email ?? ""}
        fullName={profile?.full_name ?? null}
        modulesEnabled={modulesEnabled}
        clientLogoUrl={clientLogoUrl}
      />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
