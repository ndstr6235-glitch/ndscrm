"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Mail,
  UserCog,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  Search,
  type LucideIcon,
} from "lucide-react";
import { NAV_ITEMS, ROLE_META } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions/auth";
import { useSidebar } from "./sidebar-context";
import { useCommandPalette } from "@/components/ui/command-palette-provider";
import ThemeToggle from "@/components/theme/theme-toggle";
import NotificationBell from "@/components/layout/notification-bell";
import type { Role } from "@/lib/types";

const ICON_MAP: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  clients: Users,
  calendar: Calendar,
  emails: Mail,
  contracts: FileText,
  users: UserCog,
  templates: FileText,
  settings: Settings,
};

interface SidebarProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const { collapsed, mobileOpen, toggleCollapsed, setMobileOpen } = useSidebar();
  const { open: openSearch } = useCommandPalette();
  const pathname = usePathname();
  const router = useRouter();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  const filteredNav = NAV_ITEMS.filter((item) =>
    item.roles.includes(user.role)
  );

  const activeKey = pathname.split("/")[1] || "dashboard";
  const initials = `${user.firstName[0]}${user.lastName[0]}`;

  function handleNav(key: string) {
    router.push(`/${key}`);
  }

  const sidebarContent = (isOverlay: boolean) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 shrink-0">
        <div className="w-9 h-9 rounded-[9px] bg-gradient-to-br from-gold to-gold-light flex items-center justify-center text-sm font-bold text-white shrink-0">
          ₿
        </div>
        {(isOverlay || !collapsed) && (
          <span className="font-display text-base font-bold text-white whitespace-nowrap">
            Build Fund CRM
          </span>
        )}
      </div>

      {/* Search */}
      <div className="px-2 mt-2 mb-1">
        <button
          onClick={() => {
            if (isOverlay) setMobileOpen(false);
            openSearch();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-[8px] text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all text-sm"
        >
          <Search size={18} className="shrink-0" />
          {(isOverlay || !collapsed) && (
            <>
              <span className="flex-1 text-left whitespace-nowrap">Hledat</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/[0.08] border border-white/[0.1] text-[10px] font-medium text-white/30">
                &#x2318;K
              </kbd>
            </>
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = activeKey === item.key;
          const Icon = ICON_MAP[item.key] || LayoutDashboard;
          const isCompact = !isOverlay && (collapsed || false);

          return (
            <div key={item.key} className="relative group">
              <button
                onClick={() => handleNav(item.key)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium transition-all duration-150 text-left",
                  isActive
                    ? "bg-gold/12 text-gold border-l-2 border-gold"
                    : "text-white/60 hover:text-white hover:bg-white/[0.05] border-l-2 border-transparent"
                )}
              >
                <Icon size={18} className="shrink-0" />
                {(!isCompact || isOverlay) && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </button>
              {/* Tooltip on collapsed */}
              {isCompact && !isOverlay && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 rounded-[6px] bg-sidebar text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-md border border-white/10 z-50">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle — desktop only */}
      {!isOverlay && (
        <div className="hidden lg:block px-2 mb-2">
          <button
            onClick={toggleCollapsed}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-[8px] text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all text-sm"
          >
            <ChevronLeft
              size={16}
              className={cn(
                "transition-transform duration-250",
                collapsed ? "rotate-180" : ""
              )}
            />
            {!collapsed && (
              <span className="whitespace-nowrap">Sbalit</span>
            )}
          </button>
        </div>
      )}

      {/* User info + logout */}
      <div className="border-t border-white/[0.08] px-3 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-xs font-bold text-gold shrink-0">
            {initials}
          </div>
          {(isOverlay || !collapsed) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-white/40 truncate">{ROLE_META[user.role as keyof typeof ROLE_META]?.label ?? user.role}</p>
            </div>
          )}
        </div>
        <div className="mb-1">
          <NotificationBell variant="sidebar" collapsed={!isOverlay && collapsed} />
        </div>
        <div className="mb-1">
          <ThemeToggle collapsed={!isOverlay && collapsed} />
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-white/40 hover:text-ruby hover:bg-ruby/10 transition-all text-sm"
          >
            <LogOut size={16} className="shrink-0" />
            {(isOverlay || !collapsed) && (
              <span className="whitespace-nowrap">Odhlásit</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar (lg+) */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 h-dvh bg-sidebar z-40 transition-[width] duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden",
          collapsed ? "w-[68px]" : "w-[220px]"
        )}
      >
        {sidebarContent(false)}
      </aside>

      {/* Tablet sidebar (md to lg) — always collapsed */}
      <aside className="hidden md:flex lg:hidden flex-col fixed left-0 top-0 h-dvh w-[68px] bg-sidebar z-40 overflow-hidden">
        {sidebarContent(false)}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-[280px] bg-sidebar animate-sidebar-in flex flex-col">
            {sidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
