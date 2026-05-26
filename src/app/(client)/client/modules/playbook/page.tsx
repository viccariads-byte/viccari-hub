import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlaybookView } from "@/components/client/PlaybookView";
import { type PlaybookContent } from "@/lib/actions/playbook";

export default async function PlaybookPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies")
    .select("id, modules_enabled")
    .eq("user_id", user.id)
    .single();

  if (!company) redirect("/client/dashboard");

  const enabled = (company.modules_enabled as Record<string, boolean>) ?? {};
  if (!enabled.playbook) notFound();

  const [{ data: playbook }, { data: brandBrain }] = await Promise.all([
    supabase
      .from("playbooks")
      .select("content")
      .eq("company_id", company.id)
      .maybeSingle(),
    supabase
      .from("brand_brain")
      .select("id")
      .eq("company_id", company.id)
      .maybeSingle(),
  ]);

  return (
    <PlaybookView
      companyId={company.id}
      playbook={(playbook?.content as PlaybookContent) ?? null}
      hasBrandBrain={!!brandBrain}
    />
  );
}
