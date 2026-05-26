"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ReferralStatus = "em_negociacao" | "fechado" | "perdido";
export type PaymentStatus = "pendente" | "pago";

async function recalculateTierForCompany(
  companyId: string,
  admin: ReturnType<typeof createAdminClient>
) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: closedThisMonth } = await admin
    .from("referrals")
    .select("id")
    .eq("referrer_company_id", companyId)
    .eq("status", "fechado")
    .gte("closed_at", startOfMonth);

  const count = closedThisMonth?.length ?? 0;
  const percent = count >= 3 ? 50 : count === 2 ? 35 : 20;

  if (closedThisMonth && closedThisMonth.length > 0) {
    await admin
      .from("referrals")
      .update({ commission_percent: percent })
      .in("id", closedThisMonth.map((r) => r.id));
  }
}

export async function addReferral(
  companyId: string,
  data: { name: string; email?: string; phone?: string }
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("id", companyId)
    .eq("user_id", user.id)
    .single();
  if (!company) return { error: "Empresa não encontrada." };

  const { error } = await supabase.from("referrals").insert({
    referrer_company_id: companyId,
    referred_name: data.name.trim(),
    referred_email: data.email?.trim() || null,
    referred_phone: data.phone?.trim() || null,
    status: "em_negociacao",
    payment_status: "pendente",
  });

  if (error) return { error: error.message };

  revalidatePath("/client/referrals");
  return { success: true };
}

export async function updateReferralStatus(
  referralId: string,
  status: ReferralStatus
): Promise<{ error?: string; success?: boolean }> {
  const admin = createAdminClient();

  const { data: referral } = await admin
    .from("referrals")
    .select("referrer_company_id")
    .eq("id", referralId)
    .single();
  if (!referral) return { error: "Indicação não encontrada." };

  const { error } = await admin
    .from("referrals")
    .update({
      status,
      ...(status === "fechado" ? { closed_at: new Date().toISOString() } : {}),
      ...(status !== "fechado" ? { commission_percent: null } : {}),
    })
    .eq("id", referralId);

  if (error) return { error: error.message };

  if (status === "fechado") {
    await recalculateTierForCompany(referral.referrer_company_id, admin);
  }

  revalidatePath("/admin/referrals");
  revalidatePath("/client/referrals");
  return { success: true };
}

export async function updateCommissionValue(
  referralId: string,
  commissionValue: number | null
): Promise<{ error?: string; success?: boolean }> {
  const admin = createAdminClient();

  const { error } = await admin
    .from("referrals")
    .update({ commission_value: commissionValue })
    .eq("id", referralId);

  if (error) return { error: error.message };

  revalidatePath("/admin/referrals");
  revalidatePath("/client/referrals");
  return { success: true };
}

export async function updatePaymentStatus(
  referralId: string,
  paymentStatus: PaymentStatus
): Promise<{ error?: string; success?: boolean }> {
  const admin = createAdminClient();

  const { error } = await admin
    .from("referrals")
    .update({ payment_status: paymentStatus })
    .eq("id", referralId);

  if (error) return { error: error.message };

  revalidatePath("/admin/referrals");
  revalidatePath("/client/referrals");
  return { success: true };
}
