"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ViccariLogo } from "@/components/shared/ViccariLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Errors = {
  nome?: string;
  sobrenome?: string;
  empresa?: string;
  email?: string;
  password?: string;
  confirm?: string;
};

export default function SignupPage() {
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: Errors = {};
    if (!nome.trim()) newErrors.nome = "Informe seu nome";
    if (!sobrenome.trim()) newErrors.sobrenome = "Informe seu sobrenome";
    if (!empresa.trim()) newErrors.empresa = "Informe o nome da empresa";
    if (!email.trim()) newErrors.email = "Informe seu e-mail";
    if (!password.trim()) newErrors.password = "Informe uma senha";
    else if (password.length < 6) newErrors.password = "Senha deve ter no mínimo 6 caracteres";
    if (password !== confirm) newErrors.confirm = "As senhas não coincidem";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setIsLoading(false);
      toast.error(error.message);
      return;
    }

    const user = data.user;
    if (user) {
      const fullName = `${nome.trim()} ${sobrenome.trim()}`;
      await Promise.all([
        supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id),
        supabase.from("companies").insert({ user_id: user.id, name: empresa.trim() }),
      ]);
    }

    window.location.href = "/client/briefing";
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-center mb-8">
          <ViccariLogo size="lg" />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Criar Conta</h1>
          <p className="text-[#8F68C1] text-sm">
            Preencha os dados para acessar o portal
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Nome + Sobrenome */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-white/80 text-sm font-medium">
                Nome
              </Label>
              <Input
                id="nome"
                type="text"
                placeholder="João"
                autoComplete="given-name"
                disabled={isLoading}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="bg-[#000000] border-white/10 text-white placeholder:text-white/30 focus:border-[#771FE3] focus:ring-[#771FE3]/20 h-11"
              />
              {errors.nome && <p className="text-red-400 text-xs">{errors.nome}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sobrenome" className="text-white/80 text-sm font-medium">
                Sobrenome
              </Label>
              <Input
                id="sobrenome"
                type="text"
                placeholder="Silva"
                autoComplete="family-name"
                disabled={isLoading}
                value={sobrenome}
                onChange={(e) => setSobrenome(e.target.value)}
                className="bg-[#000000] border-white/10 text-white placeholder:text-white/30 focus:border-[#771FE3] focus:ring-[#771FE3]/20 h-11"
              />
              {errors.sobrenome && <p className="text-red-400 text-xs">{errors.sobrenome}</p>}
            </div>
          </div>

          {/* Empresa */}
          <div className="space-y-2">
            <Label htmlFor="empresa" className="text-white/80 text-sm font-medium">
              Empresa
            </Label>
            <Input
              id="empresa"
              type="text"
              placeholder="Nome da sua empresa"
              autoComplete="organization"
              disabled={isLoading}
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              className="bg-[#000000] border-white/10 text-white placeholder:text-white/30 focus:border-[#771FE3] focus:ring-[#771FE3]/20 h-11"
            />
            {errors.empresa && <p className="text-red-400 text-xs">{errors.empresa}</p>}
          </div>

          {/* E-mail */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80 text-sm font-medium">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#000000] border-white/10 text-white placeholder:text-white/30 focus:border-[#771FE3] focus:ring-[#771FE3]/20 h-11"
            />
            {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/80 text-sm font-medium">
              Senha
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#000000] border-white/10 text-white placeholder:text-white/30 focus:border-[#771FE3] focus:ring-[#771FE3]/20 h-11 pr-10"
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
            {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
          </div>

          {/* Confirmar Senha */}
          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-white/80 text-sm font-medium">
              Confirmar Senha
            </Label>
            <Input
              id="confirm"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isLoading}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="bg-[#000000] border-white/10 text-white placeholder:text-white/30 focus:border-[#771FE3] focus:ring-[#771FE3]/20 h-11"
            />
            {errors.confirm && <p className="text-red-400 text-xs">{errors.confirm}</p>}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-gradient-to-r from-[#771FE3] to-[#8F68C1] hover:from-[#6a1bcc] hover:to-[#7d5aad] text-white font-semibold text-sm border-0 transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando conta...
              </>
            ) : (
              "Criar Conta"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/40 text-sm">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-[#8F68C1] hover:text-[#771FE3] transition-colors font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>

      <p className="text-center text-white/20 text-xs mt-6">
        © 2022 Viccari Ads LTDA. — Todos os direitos reservados
      </p>
    </div>
  );
}
