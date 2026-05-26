"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createNiche(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Nome obrigatório." };

  const supabase = await createClient();
  const { error } = await supabase.from("niches").insert({ name });

  if (error) {
    if (error.code === "23505") return { error: "Nicho já existe." };
    return { error: error.message };
  }

  revalidatePath("/admin/niches");
  revalidatePath("/admin/big-brain");
}

export async function deleteNiche(id: string) {
  const supabase = await createClient();

  // Block deletion if clients are using this niche
  const { count } = await supabase
    .from("company_niche")
    .select("*", { count: "exact", head: true })
    .eq("niche_id", id);

  if ((count ?? 0) > 0) {
    return { error: `Este nicho está sendo usado por ${count} cliente(s). Remova a associação antes de excluir.` };
  }

  const { error } = await supabase.from("niches").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/niches");
  revalidatePath("/admin/big-brain");
}

export async function createSubniche(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const niche_id = formData.get("niche_id") as string;
  if (!name || !niche_id) return { error: "Nome e nicho obrigatórios." };

  const supabase = await createClient();
  const { error } = await supabase.from("subniches").insert({ name, niche_id });

  if (error) {
    if (error.code === "23505") return { error: "Subnicho já existe." };
    return { error: error.message };
  }

  revalidatePath("/admin/niches");
  revalidatePath("/admin/big-brain");
}

export async function deleteSubniche(id: string) {
  const supabase = await createClient();

  const { count } = await supabase
    .from("company_niche")
    .select("*", { count: "exact", head: true })
    .eq("subniche_id", id);

  if ((count ?? 0) > 0) {
    return { error: `Este subnicho está sendo usado por ${count} cliente(s).` };
  }

  const { error } = await supabase.from("subniches").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/niches");
  revalidatePath("/admin/big-brain");
}
