"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Database, LifeBuoy } from "lucide-react";
import { updateCompanyUrls } from "@/lib/actions/company";
import { toast } from "sonner";

interface CompanyUrlsEditorProps {
  companyId: string;
  crmUrl?: string | null;
  supportUrl?: string | null;
}

export function CompanyUrlsEditor({ companyId, crmUrl, supportUrl }: CompanyUrlsEditorProps) {
  const router = useRouter();
  const [crm, setCrm] = useState(crmUrl ?? "");
  const [support, setSupport] = useState(supportUrl ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateCompanyUrls(companyId, { crm_url: crm, support_url: support });
      if (result.error) { toast.error(result.error); return; }
      toast.success("URLs atualizadas.");
      router.refresh();
    });
  }

  return (
    <div className="bg-[#111111] border border-white/10 rounded-xl p-6">
      <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-5">
        Links Externos
      </h2>
      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="flex items-center gap-1.5 text-xs text-white/40 mb-1.5">
            <Database className="w-3.5 h-3.5" />
            URL do CRM (GHL)
          </label>
          <input
            type="url"
            placeholder="https://app.gohighlevel.com/..."
            value={crm}
            onChange={(e) => setCrm(e.target.value)}
            className="w-full bg-[#000000] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-[#771FE3]/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs text-white/40 mb-1.5">
            <LifeBuoy className="w-3.5 h-3.5" />
            URL do Suporte (Chronos)
          </label>
          <input
            type="url"
            placeholder="https://..."
            value={support}
            onChange={(e) => setSupport(e.target.value)}
            className="w-full bg-[#000000] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-[#771FE3]/50 focus:outline-none"
          />
        </div>
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-[#771FE3] text-white text-sm font-semibold rounded-lg hover:bg-[#6a1bcc] disabled:opacity-60 transition-colors"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
