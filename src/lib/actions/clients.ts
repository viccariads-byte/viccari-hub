"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const ONBOARDING_PHASES = [
  { phase_number: 1, phase_name: "Setup", status: "pendente" },
  { phase_number: 2, phase_name: "Reunião de Vinculação", status: "pendente" },
  { phase_number: 3, phase_name: "Ajustes", status: "pendente" },
  { phase_number: 4, phase_name: "Aprovação Final", status: "pendente" },
  { phase_number: 5, phase_name: "Lançamento das Campanhas", status: "pendente" },
  { phase_number: 6, phase_name: "Rotina Semanal", status: "pendente" },
];

export async function createClientAccount(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const companyName = formData.get("company_name") as string;

  if (!email || !password || !companyName) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  const adminClient = createAdminClient();

  // Create auth user with role metadata
  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "client" },
    });

  if (authError) {
    if (authError.message.includes("already registered")) {
      return { error: "Este e-mail já está cadastrado." };
    }
    return { error: authError.message };
  }

  const userId = authData.user.id;

  // Wait for trigger to create profile, then ensure role is 'client'
  await adminClient
    .from("profiles")
    .upsert({ id: userId, email, role: "client" });

  // Create company record
  const { data: company, error: companyError } = await adminClient
    .from("companies")
    .insert({ user_id: userId, name: companyName })
    .select("id")
    .single();

  if (companyError || !company) {
    // Rollback: delete auth user
    await adminClient.auth.admin.deleteUser(userId);
    return { error: "Erro ao criar registro da empresa." };
  }

  // Create default onboarding phases
  await adminClient.from("onboarding_phases").insert(
    ONBOARDING_PHASES.map((p) => ({ ...p, company_id: company.id }))
  );

  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${userId}`);
}

export async function deleteClientAccount(userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const adminClient = createAdminClient();

  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  revalidatePath("/admin/clients");
  redirect("/admin/clients");
}
