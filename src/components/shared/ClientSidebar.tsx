"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Calendar,
  PlusCircle,
  FileText,
  Globe,
  Bot,
  LogOut,
} from "lucide-react";
import { ViccariLogo } from "./ViccariLogo";
import { signOut } from "@/lib/actions/auth";

const mainNavItems = [
  { href: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/client/briefing", label: "Briefing", icon: FileText },
  { href: "/client/onboarding", label: "Onboarding", icon: ClipboardList },
  { href: "/client/calendar", label: "Calendário", icon: Calendar },
  { href: "/client/generate", label: "Gerar Conteúdo", icon: PlusCircle },
];

const moduleNavItems = [
  { key: "site_briefing", href: "/client/modules/site-briefing", label: "Briefing de Site", icon: Globe },
  { key: "chatbot_briefing", href: "/client/modules/chatbot-briefing", label: "Briefing de Chatbot", icon: Bot },
];

interface ClientSidebarProps {
  email: string;
  fullName: string | null;
  modulesEnabled: Record<string, boolean>;
}

export function ClientSidebar({ email, fullName, modulesEnabled }: ClientSidebarProps) {
  const pathname = usePathname();

  const activeModules = moduleNavItems.filter((m) => modulesEnabled[m.key]);

  function navLink(href: string, label: string, Icon: React.ElementType) {
    const isActive = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        key={href}
        href={href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
          isActive
            ? "bg-gradient-to-r from-[#771FE3]/20 to-[#8F68C1]/10 text-white border border-[#771FE3]/30"
            : "text-white/50 hover:text-white hover:bg-white/5"
        }`}
      >
        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[#771FE3]" : ""}`} />
        {label}
        {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#771FE3]" />}
      </Link>
    );
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#111111] border-r border-white/10 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <ViccariLogo size="sm" />
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {mainNavItems.map(({ href, label, icon: Icon }) => navLink(href, label, Icon))}

        {activeModules.length > 0 && (
          <>
            <div className="pt-3 pb-1">
              <p className="text-[10px] text-white/20 font-semibold uppercase tracking-widest px-3">
                Módulos
              </p>
            </div>
            {activeModules.map(({ href, label, icon: Icon }) => navLink(href, label, Icon))}
          </>
        )}
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
