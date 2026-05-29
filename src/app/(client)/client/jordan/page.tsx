import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JordanClient } from "./JordanClient";

export default async function JordanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!company) redirect("/client/dashboard");

  const { data: brandBrain } = await supabase
    .from("brand_brain")
    .select("id")
    .eq("company_id", company.id)
    .maybeSingle();

  return <JordanClient companyId={company.id} hasBrandBrain={!!brandBrain} />;
}
