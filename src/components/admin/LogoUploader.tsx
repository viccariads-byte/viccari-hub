"use client";

import { useTransition, useRef } from "react";
import Image from "next/image";
import { Upload, Loader2, Building2 } from "lucide-react";
import { uploadCompanyLogo } from "@/lib/actions/company";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface LogoUploaderProps {
  companyId: string;
  currentLogoUrl?: string | null;
}

export function LogoUploader({ companyId, currentLogoUrl }: LogoUploaderProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("logo", file);

    startTransition(async () => {
      const result = await uploadCompanyLogo(companyId, formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Logo atualizado com sucesso!");
      router.refresh();
    });

    // Reset input so the same file can be re-selected
    e.target.value = "";
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        onClick={() => !isPending && fileRef.current?.click()}
        className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-[#1a1a1a] cursor-pointer group hover:border-[#771FE3]/40 transition-colors"
      >
        {currentLogoUrl ? (
          <Image
            src={currentLogoUrl}
            alt="Logo da empresa"
            fill
            className="object-contain p-1"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white/20" />
          </div>
        )}

        <div
          className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity ${
            isPending ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : (
            <Upload className="w-4 h-4 text-white" />
          )}
        </div>
      </div>

      <span className="text-[10px] text-white/25">
        {isPending ? "Enviando..." : "Clique para logo"}
      </span>

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
