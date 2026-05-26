"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export type ServiceStatus = "ativo" | "em_configuracao" | "pausado";

export async function addService(
  companyId: string,
  data: {
    service_name: string;
    service_status: ServiceStatus;
    service_description?: string;
  }
): Promise<{ error?: string; success?: boolean }> {
  const admin = createAdminClient();

  const { error } = await admin.from("company_services").insert({
    company_id: companyId,
    service_name: data.service_name,
    service_status: data.service_status,
    service_description: data.service_description?.trim() || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/clients");
  return { success: true };
}

export async function updateServiceStatus(
  serviceId: string,
  status: ServiceStatus
): Promise<{ error?: string; success?: boolean }> {
  const admin = createAdminClient();

  const { error } = await admin
    .from("company_services")
    .update({ service_status: status })
    .eq("id", serviceId);

  if (error) return { error: error.message };

  revalidatePath("/admin/clients");
  return { success: true };
}

export async function removeService(
  serviceId: string
): Promise<{ error?: string; success?: boolean }> {
  const admin = createAdminClient();

  const { error } = await admin
    .from("company_services")
    .delete()
    .eq("id", serviceId);

  if (error) return { error: error.message };

  revalidatePath("/admin/clients");
  return { success: true };
}
