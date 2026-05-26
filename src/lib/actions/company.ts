"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function uploadCompanyLogo(
  companyId: string,
  formData: FormData
): Promise<{ error?: string; success?: boolean; url?: string }> {
  const file = formData.get("logo") as File | null;
  if (!file || file.size === 0) return { error: "Nenhum arquivo enviado." };

  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Formato inválido. Use PNG, JPG, WEBP ou SVG." };
  }

  if (file.size > 2 * 1024 * 1024) {
    return { error: "Arquivo muito grande. Máximo 2 MB." };
  }

  const ext = file.type === "image/svg+xml" ? "svg" : file.type.split("/")[1];
  const path = `${companyId}/logo.${ext}`;
  const buffer = await file.arrayBuffer();

  const admin = createAdminClient();

  const { error: uploadError } = await admin.storage
    .from("client-assets")
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = admin.storage
    .from("client-assets")
    .getPublicUrl(path);

  // Append cache-busting timestamp so the sidebar image refreshes after re-upload
  const logoUrl = `${publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await admin
    .from("companies")
    .update({ logo_url: logoUrl })
    .eq("id", companyId);

  if (updateError) return { error: updateError.message };

  revalidatePath("/admin/clients");

  return { success: true, url: logoUrl };
}
