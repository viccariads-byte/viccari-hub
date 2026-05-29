import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StorytellingClient } from "./StorytellingClient";

export default async function StorytellingPage() {
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

  return <StorytellingClient companyId={company.id} />;
}
