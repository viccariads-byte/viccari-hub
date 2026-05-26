"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Bell, Globe, Bot, CheckCheck } from "lucide-react";
import { markAllNotificationsRead } from "@/lib/actions/modules";
import { toast } from "sonner";

type Notification = {
  id: string;
  message: string;
  module_type: string;
  read: boolean;
  created_at: string;
  company_id: string;
};

const MODULE_ICONS: Record<string, React.ElementType> = {
  site_briefing: Globe,
  chatbot_briefing: Bot,
};

export function NotificationsPanel({ notifications }: { notifications: Notification[] }) {
  const [items, setItems] = useState(notifications);
  const [isPending, startTransition] = useTransition();

  const unread = items.filter((n) => !n.read).length;

  function handleMarkAll() {
    startTransition(async () => {
      const result = await markAllNotificationsRead();
      if (result.error) { toast.error(result.error); return; }
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    });
  }

  return (
    <div className="bg-[#111111] border border-white/10 rounded-xl p-6 mb-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#8F68C1]" />
          <h2 className="text-lg font-semibold text-white">Notificações</h2>
          {unread > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#771FE3]/20 text-[#8F68C1] border border-[#771FE3]/30 font-medium">
              {unread} nova{unread !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={isPending}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Marcar todas como lidas
          </button>
        )}
      </div>

      <div className="space-y-2">
        {items.map((n) => {
          const Icon = MODULE_ICONS[n.module_type] ?? Bell;
          return (
            <Link
              key={n.id}
              href={`/admin/clients/${n.company_id}`}
              className={`flex items-start gap-3 p-3 rounded-lg transition-colors group ${n.read ? "hover:bg-white/5" : "bg-[#771FE3]/5 border border-[#771FE3]/15 hover:bg-[#771FE3]/10"}`}
            >
              <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${n.read ? "bg-white/5" : "bg-[#771FE3]/20"}`}>
                <Icon className={`w-3.5 h-3.5 ${n.read ? "text-white/30" : "text-[#8F68C1]"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.read ? "text-white/40" : "text-white"}`}>{n.message}</p>
                <p className="text-xs text-white/25 mt-0.5">
                  {new Date(n.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full bg-[#771FE3] flex-shrink-0 mt-1.5" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
