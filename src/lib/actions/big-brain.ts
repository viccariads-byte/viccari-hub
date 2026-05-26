"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveBigBrain(data: {
  niche_id: string;
  subniche_id: string | null;
  content: string;
}) {
  if (!data.niche_id) return { error: "Selecione um nicho." };

  const supabase = await createClient();

  // Check if record exists
  let query = supabase
    .from("big_brain")
    .select("id")
    .eq("niche_id", data.niche_id);

  if (data.subniche_id) {
    query = query.eq("subniche_id", data.subniche_id);
  } else {
    query = query.is("subniche_id", null);
  }

  const { data: existing } = await query.maybeSingle();

  let error;
  if (existing) {
    ({ error } = await supabase
      .from("big_brain")
      .update({ content: data.content, updated_at: new Date().toISOString() })
      .eq("id", existing.id));
  } else {
    ({ error } = await supabase.from("big_brain").insert({
      niche_id: data.niche_id,
      subniche_id: data.subniche_id || null,
      content: data.content,
      updated_at: new Date().toISOString(),
    }));
  }

  if (error) return { error: error.message };

  revalidatePath("/admin/big-brain");
  return { success: true };
}
