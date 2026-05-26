"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function addTeamMember(
  companyId: string,
  data: {
    member_name: string;
    member_role: string;
    member_photo_url?: string;
    member_whatsapp?: string;
    member_email?: string;
  }
): Promise<{ error?: string; success?: boolean }> {
  const admin = createAdminClient();

  const { error } = await admin.from("company_team").insert({
    company_id: companyId,
    member_name: data.member_name.trim(),
    member_role: data.member_role.trim(),
    member_photo_url: data.member_photo_url?.trim() || null,
    member_whatsapp: data.member_whatsapp?.trim() || null,
    member_email: data.member_email?.trim() || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/clients");
  return { success: true };
}

export async function removeTeamMember(
  memberId: string
): Promise<{ error?: string; success?: boolean }> {
  const admin = createAdminClient();

  const { error } = await admin
    .from("company_team")
    .delete()
    .eq("id", memberId);

  if (error) return { error: error.message };

  revalidatePath("/admin/clients");
  return { success: true };
}
