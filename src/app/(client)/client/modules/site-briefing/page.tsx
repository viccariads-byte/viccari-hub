import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteBriefingForm } from "@/components/client/SiteBriefingForm";

export default async function SiteBriefingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies")
    .select("id, modules_enabled")
    .eq("user_id", user.id)
    .single();

  if (!company) redirect("/client/dashboard");

  const enabled = (company.modules_enabled as Record<string, boolean>) ?? {};
  if (!enabled.site_briefing) notFound();

  const { data: submission } = await supabase
    .from("module_submissions")
    .select("form_data, current_step")
    .eq("company_id", company.id)
    .eq("module_type", "site_briefing")
    .maybeSingle();

  return (
    <SiteBriefingForm
      existingData={(submission?.form_data as Record<string, unknown>) ?? null}
      savedStep={submission?.current_step ?? 1}
    />
  );
}
