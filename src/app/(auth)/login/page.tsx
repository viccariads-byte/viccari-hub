"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ViccariLogo } from "@/components/shared/ViccariLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = "Informe seu e-mail";
    if (!password.trim()) newErrors.password = "Informe sua senha";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setIsLoading(false);
      toast.error("Credenciais inválidas. Verifique seu e-mail e senha.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/client/dashboard";
      }
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-center mb-8">
          <ViccariLogo size="lg" />
        </div>

        {/* ANIMA identity block */}
        <div className="text-center mb-8 pb-8 border-b border-white/10">
          <p
            className="font-bold text-[#771FE3] tracking-[0.3em] mb-2"
            style={{ fontSize: 32, fontFamily: "Raleway, sans-serif", fontWeight: 700 }}
          >
            ANIMA
          </p>
          <p
            className="italic text-white/70"
            style={{ fontSize: 14, fontFamily: "Raleway, sans-serif", fontWeight: 300 }}
          >
            A ANIMA é o documento vivo da sua marca. Tudo que criamos nasce daqui.
          </p>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Bem-vindo ao Hub</h1>
          <p className="text-[#8F68C1] text-sm">
            Entre com suas credenciais para acessar o portal
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
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
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/80 text-sm font-medium">
              Senha
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
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
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-gradient-to-r from-[#771FE3] to-[#8F68C1] hover:from-[#6a1bcc] hover:to-[#7d5aad] text-white font-semibold text-sm border-0 transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar no Hub"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/40 text-sm">
            Ainda não tem conta?{" "}
            <Link href="/signup" className="text-[#8F68C1] hover:text-[#771FE3] transition-colors font-medium">
              Criar Conta
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
