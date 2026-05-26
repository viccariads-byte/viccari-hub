"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteClientAccount } from "@/lib/actions/clients";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteClientButtonProps {
  userId: string;
  clientName: string;
}

export function DeleteClientButton({ userId, clientName }: DeleteClientButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteClientAccount(userId);
    if (result?.error) {
      setIsDeleting(false);
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 text-sm transition-all duration-150">
        <Trash2 className="w-4 h-4" />
        Excluir
      </DialogTrigger>
      <DialogContent className="bg-[#111111] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Excluir cliente</DialogTitle>
          <DialogDescription className="text-white/50">
            Tem certeza que deseja excluir{" "}
            <span className="text-white font-medium">{clientName}</span>? Esta
            ação remove todos os dados, briefing, conteúdos e onboarding. Não pode
            ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
            className="border-white/10 text-white/60 hover:text-white hover:bg-white/5 bg-transparent"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 text-white border-0"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir permanentemente"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
