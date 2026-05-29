import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ViccariLogo } from "@/components/shared/ViccariLogo";

export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "client") redirect("/login");

  // If briefing already complete, send to hub
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (company) {
    const { data: briefing } = await supabase
      .from("briefing_answers")
      .select("current_step")
      .eq("company_id", company.id)
      .maybeSingle();

    if ((briefing?.current_step ?? 0) >= 5) {
      redirect("/client/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col">
      {/* Top bar — logo only */}
      <div className="px-8 py-5 border-b border-white/5 flex-shrink-0">
        <ViccariLogo variant="solid" size="sm" />
      </div>

      {/* Content — scrollable, centered */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-10">
          {children}
        </div>
      </div>
    </div>
  );
}
