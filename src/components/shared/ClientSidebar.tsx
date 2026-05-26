"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Calendar,
  PlusCircle,
  FileText,
  Globe,
  Bot,
  BookOpen,
  Gift,
  Users,
  Layers,
  Database,
  LifeBuoy,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { ViccariLogo } from "./ViccariLogo";
import { signOut } from "@/lib/actions/auth";
import { toast } from "sonner";

interface NavItemDef {
  href: string;
  label: string;
  icon: React.ElementType;
  moduleKey?: string;
}

const NAV_ITEMS: NavItemDef[] = [
  { href: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/client/briefing", label: "Briefing da Marca", icon: FileText },
  { href: "/client/modules/site-briefing", label: "Briefing do Site", icon: Globe, moduleKey: "site_briefing" },
  { href: "/client/modules/chatbot-briefing", label: "Briefing do Chatbot", icon: Bot, moduleKey: "chatbot_briefing" },
  { href: "/client/onboarding", label: "Onboarding", icon: ClipboardList },
  { href: "/client/calendar", label: "Calendário", icon: Calendar },
  { href: "/client/generate", label: "Gerar Conteúdo", icon: PlusCircle },
  { href: "/client/modules/playbook", label: "Playbook Comercial", icon: BookOpen, moduleKey: "playbook" },
  { href: "/client/team", label: "Meu Time", icon: Users },
  { href: "/client/services", label: "Meus Serviços", icon: Layers },
  { href: "/client/referrals", label: "Indicações", icon: Gift },
];

const EXTERNAL_ITEMS = [
  { label: "CRM", icon: Database, urlKey: "crmUrl" as const },
  { label: "Suporte", icon: LifeBuoy, urlKey: "supportUrl" as const },
];

interface ClientSidebarProps {
  email: string;
  fullName: string | null;
  modulesEnabled: Record<string, boolean>;
  clientLogoUrl?: string | null;
  crmUrl?: string | null;
  supportUrl?: string | null;
}

export function ClientSidebar({ email, fullName, modulesEnabled, clientLogoUrl, crmUrl, supportUrl }: ClientSidebarProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.moduleKey || modulesEnabled[item.moduleKey]
  );

  const externalUrls = { crmUrl, supportUrl };

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

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#111111] border-r border-white/10 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-white/10 flex items-center" style={{ minHeight: 80 }}>
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
        {visibleItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-gradient-to-r from-[#771FE3]/20 to-[#8F68C1]/10 text-white border border-[#771FE3]/30"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-[#771FE3]" : ""}`} />
              {label}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#771FE3]" />}
            </Link>
          );
        })}

        {/* External links: CRM + Suporte */}
        {EXTERNAL_ITEMS.map(({ label, icon: Icon, urlKey }) => {
          const url = externalUrls[urlKey];
          return (
            <button
              key={label}
              type="button"
              onClick={() => handleExternalClick(url, label)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-150"
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {url
                ? <ExternalLink className="w-3 h-3 ml-auto opacity-40" />
                : <span className="ml-auto text-[10px] text-white/20">em breve</span>
              }
            </button>
          );
        })}
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
