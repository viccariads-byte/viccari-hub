"use client";

import { useState } from "react";
import { ArrowLeft, Loader2, Eye, EyeOff, UserPlus } from "lucide-react";
import Link from "next/link";
import { createClientAccount } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Errors = {
  company_name?: string;
  email?: string;
  password?: string;
};

export default function NewClientPage() {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: Errors = {};
    if (!companyName.trim()) newErrors.company_name = "Nome da empresa é obrigatório";
    if (!email.trim()) newErrors.email = "E-mail é obrigatório";
    if (!password.trim()) newErrors.password = "Senha é obrigatória";
    else if (password.length < 8) newErrors.password = "Senha deve ter no mínimo 8 caracteres";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setServerError(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.set("company_name", companyName.trim());
    formData.set("email", email.trim());
    formData.set("password", password);

    const result = await createClientAccount(formData);

    if (result?.error) {
      setServerError(result.error);
      setIsLoading(false);
    }
    // On success, createClientAccount redirects — no need to handle here
  }

  return (
    <div className="max-w-xl">
      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Clientes
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Novo Cliente</h1>
        <p className="text-white/50 mt-1">
          Crie a conta de acesso do cliente ao portal.
        </p>
      </div>

      <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
        <form onSubmit={onSubmit} className="space-y-5">
          {/* Company name */}
          <div className="space-y-2">
            <Label className="text-white/80 text-sm font-medium">
              Nome da Empresa <span className="text-[#771FE3]">*</span>
            </Label>
            <Input
              placeholder="Ex: Clínica Estética Aline"
              disabled={isLoading}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="bg-[#000000] border-white/10 text-white placeholder:text-white/30 focus:border-[#771FE3] h-11"
            />
            {errors.company_name && (
              <p className="text-red-400 text-xs">{errors.company_name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="text-white/80 text-sm font-medium">
              E-mail de acesso <span className="text-[#771FE3]">*</span>
            </Label>
            <Input
              type="email"
              placeholder="cliente@empresa.com"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#000000] border-white/10 text-white placeholder:text-white/30 focus:border-[#771FE3] h-11"
            />
            {errors.email && (
              <p className="text-red-400 text-xs">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label className="text-white/80 text-sm font-medium">
              Senha inicial <span className="text-[#771FE3]">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#000000] border-white/10 text-white placeholder:text-white/30 focus:border-[#771FE3] h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs">{errors.password}</p>
            )}
            <p className="text-white/30 text-xs">Mínimo 8 caracteres.</p>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm">{serverError}</p>
            </div>
          )}

          {/* Info box */}
          <div className="bg-[#771FE3]/8 border border-[#771FE3]/20 rounded-lg px-4 py-3 space-y-1">
            <p className="text-white/60 text-xs font-medium">O que será criado automaticamente:</p>
            <ul className="text-white/40 text-xs space-y-0.5 list-disc list-inside">
              <li>Conta de acesso ao portal</li>
              <li>Registro da empresa</li>
              <li>6 fases de onboarding (status: pendente)</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Link
              href="/admin/clients"
              className="flex-1 h-11 inline-flex items-center justify-center rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
            >
              Cancelar
            </Link>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 bg-gradient-to-r from-[#771FE3] to-[#8F68C1] hover:from-[#6a1bcc] hover:to-[#7d5aad] text-white font-semibold border-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Criar Cliente
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
