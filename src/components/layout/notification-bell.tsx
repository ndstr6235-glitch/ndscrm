"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  X,
  CheckCheck,
  Phone,
  CreditCard,
  UserPlus,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  type NotificationRow,
} from "@/app/actions/notifications";

const TYPE_CONFIG: Record<
  string,
  { icon: typeof Bell; color: string; bg: string }
> = {
  payment_due: { icon: CreditCard, color: "text-amber", bg: "bg-amber-pale" },
  call_today: { icon: Phone, color: "text-emerald", bg: "bg-emerald-pale" },
  client_assigned: { icon: UserPlus, color: "text-sapphire", bg: "bg-sapphire-pale" },
  reminder: { icon: Clock, color: "text-gold", bg: "bg-gold-pale" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "prave ted";
  if (minutes < 60) return `pred ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `pred ${hours} h`;
  const days = Math.floor(hours / 24);
  return `pred ${days} d`;
}

interface Props {
  variant: "sidebar" | "mobile";
  collapsed?: boolean;
}

export default function NotificationBell({ variant, collapsed }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Load on mount + poll every 30s + refetch on window focus
  useEffect(() => {
    async function fetch() {
      const data = await getNotifications();
      setNotifications(data);
      setLoaded(true);
    }
    startTransition(() => { fetch(); });
    const iv = setInterval(() => { startTransition(() => { fetch(); }); }, 30000);
    const onFocus = () => { startTransition(() => { fetch(); }); };
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(iv); window.removeEventListener("focus", onFocus); };
  }, []);

  // Close on outside click (desktop)
  useEffect(() => {
    if (!open || variant === "mobile") return;
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, variant]);

  // Lock body scroll on mobile when open
  useEffect(() => {
    if (variant === "mobile" && open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open, variant]);

  async function handleClickNotification(n: NotificationRow) {
    if (!n.read) {
      await markAsRead(n.id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
      );
    }
    if (n.link) {
      setOpen(false);
      router.push(n.link);
    }
  }

  async function handleMarkAllRead() {
    await markAllAsRead();
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }

  const bellButton = (
    <button
      ref={buttonRef}
      onClick={() => setOpen(!open)}
      className={cn(
        "relative flex items-center justify-center transition-colors",
        variant === "sidebar"
          ? "w-full flex items-center gap-3 px-3 py-2 rounded-[8px] text-white/60 hover:text-white hover:bg-white/[0.06] text-sm"
          : "w-11 h-11 rounded-[8px] hover:bg-surface-hover"
      )}
    >
      <Bell
        size={variant === "sidebar" ? 18 : 18}
        className={cn(
          "shrink-0",
          variant === "mobile" && "text-text-dim"
        )}
      />
      {variant === "sidebar" && !collapsed && (
        <span className="whitespace-nowrap">Notifikace</span>
      )}
      {unreadCount > 0 && (
        <span
          className={cn(
            "absolute flex items-center justify-center text-[10px] font-bold text-white bg-ruby rounded-full min-w-[18px] h-[18px] px-1",
            variant === "sidebar"
              ? collapsed
                ? "top-0.5 right-0.5"
                : "top-0.5 right-2"
              : "-top-0.5 -right-0.5"
          )}
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );

  if (!loaded) return bellButton;

  // Mobile: fullscreen panel
  if (variant === "mobile" && open) {
    return (
      <>
        {bellButton}
        <div className="fixed inset-0 z-[80] bg-surface flex flex-col animate-fade-in">
          <div className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
            <h2 className="text-base font-semibold text-text">Notifikace</h2>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-gold hover:text-gold-light transition-colors min-h-[44px] px-2"
                >
                  Oznacit vse
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="w-11 h-11 flex items-center justify-center rounded-[8px] hover:bg-surface-hover"
              >
                <X size={20} className="text-text-dim" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <NotificationList
              notifications={notifications}
              onClickNotification={handleClickNotification}
            />
          </div>
        </div>
      </>
    );
  }

  // Desktop: dropdown panel
  return (
    <div className="relative">
      {bellButton}
      {open && (
        <div
          ref={panelRef}
          className={cn(
            "absolute z-[80] bg-surface border border-border rounded-[12px] shadow-lg overflow-hidden",
            variant === "sidebar"
              ? "left-full top-0 ml-2 w-[calc(100vw-2rem)] sm:w-[360px]"
              : "right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-[360px]"
          )}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text">Notifikace</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-gold hover:text-gold-light transition-colors"
              >
                <CheckCheck size={14} />
                Oznacit vse
              </button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <NotificationList
              notifications={notifications}
              onClickNotification={handleClickNotification}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationList({
  notifications,
  onClickNotification,
}: {
  notifications: NotificationRow[];
  onClickNotification: (n: NotificationRow) => void;
}) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-faint">
        <Bell size={32} className="mb-2" />
        <p className="text-sm">Žádné nové notifikace</p>
      </div>
    );
  }

  return (
    <div>
      {notifications.map((n) => {
        const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.reminder;
        const Icon = config.icon;

        return (
          <button
            key={n.id}
            onClick={() => onClickNotification(n)}
            className={cn(
              "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-surface-hover transition-colors border-b border-border/50 last:border-b-0",
              !n.read && "bg-gold-pale/20"
            )}
          >
            <div
              className={cn(
                "w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0 mt-0.5",
                config.bg
              )}
            >
              <Icon size={16} className={config.color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p
                  className={cn(
                    "text-sm truncate",
                    n.read ? "text-text-mid" : "font-semibold text-text"
                  )}
                >
                  {n.title}
                </p>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-ruby shrink-0" />
                )}
              </div>
              <p className="text-xs text-text-dim mt-0.5 truncate">
                {n.message}
              </p>
              <p className="text-[11px] text-text-faint mt-1">
                {timeAgo(n.createdAt)}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
