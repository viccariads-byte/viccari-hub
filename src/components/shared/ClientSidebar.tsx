"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Brain,
  PenLine,
  BookOpen,
  Bot,
  Handshake,
  Headphones,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Calendar,
  LogOut,
} from "lucide-react";
import { ViccariLogo } from "./ViccariLogo";
import { signOut } from "@/lib/actions/auth";
import { toast } from "sonner";

interface ClientSidebarProps {
  email: string;
  fullName: string | null;
  modulesEnabled: Record<string, boolean>;
  clientLogoUrl?: string | null;
  crmUrl?: string | null;
  supportUrl?: string | null;
}

export function ClientSidebar({
  email,
  fullName,
  modulesEnabled,
  clientLogoUrl,
  crmUrl,
  supportUrl,
}: ClientSidebarProps) {
  const pathname = usePathname();
  const [criacaoOpen, setCriacaoOpen] = useState(
    pathname.startsWith("/client/create") || pathname.startsWith("/client/calendar")
  );

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  function handleExternalClick(url: string | null | undefined, label: string) {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      toast.info(`${label}: em breve disponível`);
    }
  }

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
      active
        ? "bg-gradient-to-r from-[#771FE3]/20 to-[#8F68C1]/10 text-white border border-[#771FE3]/30"
        : "text-white/50 hover:text-white hover:bg-white/5"
    }`;

  const subLinkClass = (active: boolean) =>
    `flex items-center gap-3 pl-9 pr-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
      active
        ? "text-[#771FE3]"
        : "text-white/40 hover:text-white hover:bg-white/5"
    }`;

  const criacaoActive =
    pathname.startsWith("/client/create") || pathname.startsWith("/client/calendar");

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#111111] border-r border-white/10 flex flex-col z-50">
      {/* Logo */}
      <div
        className="p-6 border-b border-white/10 flex items-center"
        style={{ minHeight: 80 }}
      >
        {clientLogoUrl ? (
          <Image
            src={clientLogoUrl}
            alt="Logo da empresa"
            height={40}
            width={160}
            style={{ height: 40, width: "auto", maxWidth: 160 }}
            className="object-contain object-left"
            priority
          />
        ) : (
          <ViccariLogo variant="solid" size="sm" />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {/* ANIMA */}
        <Link href="/client/briefing" className={linkClass(isActive("/client/briefing"))}>
          <Brain
            className={`w-4 h-4 flex-shrink-0 ${isActive("/client/briefing") ? "text-[#771FE3]" : ""}`}
          />
          ANIMA
          {isActive("/client/briefing") && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#771FE3]" />
          )}
        </Link>

        {/* Criação — expansível */}
        <div>
          <button
            type="button"
            onClick={() => setCriacaoOpen((v) => !v)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              criacaoActive
                ? "bg-gradient-to-r from-[#771FE3]/20 to-[#8F68C1]/10 text-white border border-[#771FE3]/30"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <PenLine
              className={`w-4 h-4 flex-shrink-0 ${criacaoActive ? "text-[#771FE3]" : ""}`}
            />
            Criação
            <span className="ml-auto">
              {criacaoOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </span>
          </button>

          {criacaoOpen && (
            <div className="mt-0.5 space-y-0.5">
              <Link
                href="/client/create/storytelling"
                className={subLinkClass(isActive("/client/create/storytelling"))}
              >
                <PenLine className="w-3.5 h-3.5 flex-shrink-0" />
                Storytelling
              </Link>
              <Link
                href="/client/calendar"
                className={subLinkClass(isActive("/client/calendar"))}
              >
                <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                Calendário
              </Link>
            </div>
          )}
        </div>

        {/* Playbook Comercial */}
        {modulesEnabled["playbook"] && (
          <Link
            href="/client/modules/playbook"
            className={linkClass(isActive("/client/modules/playbook"))}
          >
            <BookOpen
              className={`w-4 h-4 flex-shrink-0 ${isActive("/client/modules/playbook") ? "text-[#771FE3]" : ""}`}
            />
            Playbook Comercial
            {isActive("/client/modules/playbook") && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#771FE3]" />
            )}
          </Link>
        )}

        {/* Jordan */}
        <Link href="/client/jordan" className={linkClass(isActive("/client/jordan"))}>
          <Bot
            className={`w-4 h-4 flex-shrink-0 ${isActive("/client/jordan") ? "text-[#771FE3]" : ""}`}
          />
          Jordan
          {isActive("/client/jordan") && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#771FE3]" />
          )}
        </Link>

        {/* Indicações */}
        <Link href="/client/referrals" className={linkClass(isActive("/client/referrals"))}>
          <Handshake
            className={`w-4 h-4 flex-shrink-0 ${isActive("/client/referrals") ? "text-[#771FE3]" : ""}`}
          />
          Indicações
          {isActive("/client/referrals") && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#771FE3]" />
          )}
        </Link>

        <div className="pt-2 border-t border-white/5 mt-2 space-y-0.5">
          {/* CRM */}
          <button
            type="button"
            onClick={() => handleExternalClick(crmUrl, "CRM")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-150"
          >
            <ExternalLink className="w-4 h-4 flex-shrink-0" />
            CRM
            {crmUrl ? (
              <ExternalLink className="w-3 h-3 ml-auto opacity-40" />
            ) : (
              <span className="ml-auto text-[10px] text-white/20">em breve</span>
            )}
          </button>

          {/* Suporte */}
          <button
            type="button"
            onClick={() => handleExternalClick(supportUrl, "Suporte")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-150"
          >
            <Headphones className="w-4 h-4 flex-shrink-0" />
            Suporte
            {supportUrl ? (
              <ExternalLink className="w-3 h-3 ml-auto opacity-40" />
            ) : (
              <span className="ml-auto text-[10px] text-white/20">em breve</span>
            )}
          </button>
        </div>
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-white/10">
        <div className="mb-3 px-3">
          {fullName && (
            <p className="text-sm text-white font-medium truncate mb-0.5">{fullName}</p>
          )}
          <p className="text-xs text-white/40 truncate">{email}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-all duration-150 w-full"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
