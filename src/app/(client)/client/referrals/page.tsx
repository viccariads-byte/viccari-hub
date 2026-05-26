import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReferralsView } from "@/components/client/ReferralsView";

export default async function ReferralsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!company) redirect("/client/dashboard");

  const { data: referrals } = await supabase
    .from("referrals")
    .select(
      "id, referred_name, referred_email, referred_phone, status, commission_percent, commission_value, payment_status, created_at, closed_at"
    )
    .eq("referrer_company_id", company.id)
    .order("created_at", { ascending: false });

  return (
    <ReferralsView
      companyId={company.id}
      referrals={referrals ?? []}
    />
  );
}
