import { createClient } from "@/lib/supabase/server";
import { ReferralManager } from "@/components/admin/ReferralManager";

export default async function AdminReferralsPage() {
  const supabase = await createClient();

  const { data: referrals } = await supabase
    .from("referrals")
    .select(`
      id, referred_name, referred_email, referred_phone,
      status, commission_percent, commission_value, payment_status,
      created_at, closed_at,
      companies!referrals_referrer_company_id_fkey(name)
    `)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Indicações</h1>
        <p className="text-white/50 mt-1">
          Gerencie todas as indicações, comissões e pagamentos.
        </p>
      </div>

      <ReferralManager
        referrals={
          (referrals ?? []).map((r) => ({
            ...r,
            companies: Array.isArray(r.companies) ? r.companies[0] ?? null : r.companies,
          })) as Parameters<typeof ReferralManager>[0]["referrals"]
        }
      />
    </div>
  );
}
