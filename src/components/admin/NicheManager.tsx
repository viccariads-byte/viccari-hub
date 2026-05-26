"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Loader2,
  Tag,
  Hash,
} from "lucide-react";
import { createNiche, deleteNiche, createSubniche, deleteSubniche } from "@/lib/actions/niches";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Subniche {
  id: string;
  name: string;
  niche_id: string;
}

interface Niche {
  id: string;
  name: string;
  subniches: Subniche[];
  clientCount: number;
}

interface Props {
  initialNiches: Niche[];
}

export function NicheManager({ initialNiches }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [addingSubFor, setAddingSubFor] = useState<string | null>(null);
  const [showAddNiche, setShowAddNiche] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  function handleCreateNiche(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string)?.trim();
    if (!name) return;
    e.currentTarget.reset();
    setShowAddNiche(false);
    startTransition(async () => {
      const result = await createNiche(fd);
      if (result?.error) toast.error(result.error);
      else toast.success(`Nicho "${name}" criado.`);
    });
  }

  function handleDeleteNiche(id: string, name: string) {
    startTransition(async () => {
      const result = await deleteNiche(id);
      if (result?.error) toast.error(result.error);
      else toast.success(`Nicho "${name}" excluído.`);
    });
  }

  function handleCreateSubniche(e: React.FormEvent<HTMLFormElement>, nicheId: string) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("niche_id", nicheId);
    const name = (fd.get("name") as string)?.trim();
    if (!name) return;
    e.currentTarget.reset();
    setAddingSubFor(null);
    startTransition(async () => {
      const result = await createSubniche(fd);
      if (result?.error) toast.error(result.error);
      else toast.success(`Subnicho "${name}" criado.`);
    });
  }

  function handleDeleteSubniche(id: string, name: string) {
    startTransition(async () => {
      const result = await deleteSubniche(id);
      if (result?.error) toast.error(result.error);
      else toast.success(`Subnicho "${name}" excluído.`);
    });
  }

  return (
    <div className="space-y-3">
      {/* Niche list */}
      {initialNiches.map((niche) => {
        const isOpen = expanded.has(niche.id);
        return (
          <div
            key={niche.id}
            className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden"
          >
            {/* Niche row */}
            <div className="flex items-center gap-3 px-4 py-3">
              <button
                onClick={() => toggleExpand(niche.id)}
                className="flex items-center gap-2 flex-1 text-left"
              >
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-white/40 flex-shrink-0" />
                )}
                <Tag className="w-4 h-4 text-[#771FE3] flex-shrink-0" />
                <span className="font-medium text-white">{niche.name}</span>
                <span className="text-xs text-white/30 ml-1">
                  {niche.subniches.length} subnicho{niche.subniches.length !== 1 ? "s" : ""}
                  {niche.clientCount > 0 && (
                    <> · {niche.clientCount} cliente{niche.clientCount !== 1 ? "s" : ""}</>
                  )}
                </span>
              </button>

              <button
                onClick={() => {
                  setAddingSubFor(niche.id);
                  setExpanded((prev) => { const s = new Set(prev); s.add(niche.id); return s; });
                }}
                className="p-1.5 rounded-md text-white/30 hover:text-[#771FE3] hover:bg-[#771FE3]/10 transition-colors"
                title="Adicionar subnicho"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleDeleteNiche(niche.id, niche.name)}
                disabled={isPending}
                className="p-1.5 rounded-md text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                title="Excluir nicho"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Subniches */}
            {isOpen && (
              <div className="border-t border-white/5 bg-[#000000]/40">
                {niche.subniches.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center gap-3 px-6 py-2.5 border-b border-white/5 last:border-0"
                  >
                    <Hash className="w-3.5 h-3.5 text-[#8F68C1] flex-shrink-0" />
                    <span className="text-sm text-white/70 flex-1">{sub.name}</span>
                    <button
                      onClick={() => handleDeleteSubniche(sub.id, sub.name)}
                      disabled={isPending}
                      className="p-1 rounded text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      title="Excluir subnicho"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Add subniche form */}
                {addingSubFor === niche.id ? (
                  <form
                    onSubmit={(e) => handleCreateSubniche(e, niche.id)}
                    className="flex gap-2 px-6 py-3"
                  >
                    <Input
                      name="name"
                      placeholder="Nome do subnicho"
                      autoFocus
                      className="h-8 text-sm bg-[#111111] border-white/10 text-white placeholder:text-white/25 focus:border-[#771FE3]"
                    />
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="h-8 text-xs bg-gradient-to-r from-[#771FE3] to-[#8F68C1] text-white border-0 px-3"
                    >
                      {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Criar"}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setAddingSubFor(null)}
                      className="h-8 text-xs bg-transparent border-white/10 text-white/40 hover:text-white px-3"
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </form>
                ) : (
                  <button
                    onClick={() => setAddingSubFor(niche.id)}
                    className="flex items-center gap-2 px-6 py-2.5 text-xs text-white/30 hover:text-[#8F68C1] w-full transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Adicionar subnicho
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Add niche */}
      {showAddNiche ? (
        <form
          onSubmit={handleCreateNiche}
          className="flex gap-2 bg-[#111111] border border-[#771FE3]/30 rounded-xl px-4 py-3"
        >
          <Tag className="w-4 h-4 text-[#771FE3] flex-shrink-0 mt-2.5" />
          <Input
            name="name"
            placeholder="Nome do nicho"
            autoFocus
            className="h-9 text-sm bg-[#000000] border-white/10 text-white placeholder:text-white/25 focus:border-[#771FE3]"
          />
          <Button
            type="submit"
            disabled={isPending}
            className="h-9 text-sm bg-gradient-to-r from-[#771FE3] to-[#8F68C1] text-white border-0 px-4"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Nicho"}
          </Button>
          <Button
            type="button"
            onClick={() => setShowAddNiche(false)}
            variant="outline"
            className="h-9 text-sm bg-transparent border-white/10 text-white/40 hover:text-white px-3"
          >
            Cancelar
          </Button>
        </form>
      ) : (
        <button
          onClick={() => setShowAddNiche(true)}
          className="flex items-center justify-center gap-2 w-full py-3 border border-dashed border-white/15 rounded-xl text-sm text-white/30 hover:text-white hover:border-white/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Nicho
        </button>
      )}
    </div>
  );
}
