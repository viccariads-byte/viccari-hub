import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessageCircle, Mail, Users } from "lucide-react";

export default async function TeamPage() {
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

  const { data: team } = await supabase
    .from("company_team")
    .select("id, member_name, member_role, member_photo_url, member_whatsapp, member_email")
    .eq("company_id", company.id)
    .order("created_at");

  function initials(name: string) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Meu Time Viccari</h1>
        <p className="text-white/50 mt-1">
          Conheça os profissionais responsáveis pelo seu crescimento.
        </p>
      </div>

      {!team || team.length === 0 ? (
        <div className="bg-[#111111] border border-white/10 rounded-xl p-16 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-white/15" />
          <p className="text-white/30 text-sm">
            Seu time ainda está sendo configurado. Em breve os responsáveis aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {team.map((member) => (
            <div
              key={member.id}
              className="bg-[#111111] border border-white/10 rounded-xl p-6 hover:border-[#771FE3]/20 transition-colors"
            >
              <div className="flex items-start gap-4 mb-5">
                {member.member_photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.member_photo_url}
                    alt={member.member_name}
                    className="w-14 h-14 rounded-full object-cover flex-shrink-0 border-2 border-[#771FE3]/20"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#771FE3] to-[#8F68C1] flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                    {initials(member.member_name)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-white font-semibold text-base truncate">
                    {member.member_name}
                  </p>
                  <p className="text-[#8F68C1] text-sm mt-0.5">{member.member_role}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {member.member_whatsapp && (
                  <a
                    href={`https://wa.me/${member.member_whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium rounded-lg hover:bg-green-500/15 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                )}
                {member.member_email && (
                  <a
                    href={`mailto:${member.member_email}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/5 border border-white/10 text-white/60 text-sm font-medium rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    E-mail
                  </a>
                )}
                {!member.member_whatsapp && !member.member_email && (
                  <p className="text-white/20 text-xs py-2">Sem contato cadastrado</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
