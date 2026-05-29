"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { addTeamMember, removeTeamMember } from "@/lib/actions/team";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  member_name: string;
  member_role: string;
  member_photo_url: string | null;
  member_whatsapp: string | null;
  member_email: string | null;
}

interface TeamManagerProps {
  companyId: string;
  members: TeamMember[];
}

const EMPTY_FORM = {
  member_name: "",
  member_role: "",
  member_photo_url: "",
  member_whatsapp: "",
  member_email: "",
};

export function TeamManager({ companyId, members }: TeamManagerProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isPending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.member_name.trim() || !form.member_role.trim()) return;
    startTransition(async () => {
      const result = await addTeamMember(companyId, form);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Membro adicionado.");
      setForm(EMPTY_FORM);
      setShowForm(false);
      router.refresh();
    });
  }

  function handleRemove(memberId: string, name: string) {
    startTransition(async () => {
      const result = await removeTeamMember(memberId);
      if (result.error) { toast.error(result.error); return; }
      toast.success(`${name} removido do time.`);
      router.refresh();
    });
  }

  function initials(name: string) {
    return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
  }

  return (
    <div className="bg-[#111111] border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
          Time do Cliente
        </h2>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-xs text-[#8F68C1] hover:text-[#771FE3] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar membro
          {showForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="mb-5 grid grid-cols-2 gap-2.5 p-4 bg-black/20 rounded-xl border border-white/5">
          <input required placeholder="Nome *" value={form.member_name} onChange={(e) => setForm((p) => ({ ...p, member_name: e.target.value }))}
            className="bg-[#000000] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-[#771FE3]/50 focus:outline-none" />
          <input required placeholder="Função *" value={form.member_role} onChange={(e) => setForm((p) => ({ ...p, member_role: e.target.value }))}
            className="bg-[#000000] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-[#771FE3]/50 focus:outline-none" />
          <input placeholder="WhatsApp (só números)" value={form.member_whatsapp} onChange={(e) => setForm((p) => ({ ...p, member_whatsapp: e.target.value }))}
            className="bg-[#000000] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-[#771FE3]/50 focus:outline-none" />
          <input type="email" placeholder="E-mail" value={form.member_email} onChange={(e) => setForm((p) => ({ ...p, member_email: e.target.value }))}
            className="bg-[#000000] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-[#771FE3]/50 focus:outline-none" />
          <input placeholder="URL da foto (opcional)" value={form.member_photo_url} onChange={(e) => setForm((p) => ({ ...p, member_photo_url: e.target.value }))}
            className="col-span-2 bg-[#000000] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-[#771FE3]/50 focus:outline-none" />
          <div className="col-span-2 flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-white/40 hover:text-white transition-colors">Cancelar</button>
            <button type="submit" disabled={isPending} className="flex items-center gap-2 px-4 py-2 bg-[#771FE3] text-white text-sm font-semibold rounded-lg hover:bg-[#6a1bcc] disabled:opacity-60 transition-colors">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Adicionar
            </button>
          </div>
        </form>
      )}

      {/* Members list */}
      {members.length === 0 ? (
        <p className="text-white/25 text-sm text-center py-4">Nenhum membro no time ainda.</p>
      ) : (
        <div className="space-y-3">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5">
              {m.member_photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.member_photo_url} alt={m.member_name} className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-white/10" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#771FE3] to-[#8F68C1] flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                  {initials(m.member_name)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{m.member_name}</p>
                <p className="text-xs text-[#8F68C1] truncate">{m.member_role}</p>
                {(m.member_whatsapp || m.member_email) && (
                  <p className="text-[11px] text-white/25 mt-0.5 truncate">
                    {m.member_whatsapp && `📱 ${m.member_whatsapp}`}
                    {m.member_whatsapp && m.member_email && " · "}
                    {m.member_email && `✉ ${m.member_email}`}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleRemove(m.id, m.member_name)}
                disabled={isPending}
                className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
