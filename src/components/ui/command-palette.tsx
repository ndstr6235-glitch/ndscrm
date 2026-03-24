"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Users,
  Calendar,
  UserCog,
  LayoutDashboard,
  Mail,
  FileText,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { globalSearch, type SearchResult } from "@/app/actions/search";
import { NAV_ITEMS } from "@/lib/constants";
import type { Role } from "@/lib/types";

const NAV_ICON_MAP: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  clients: Users,
  calendar: Calendar,
  emails: Mail,
  users: UserCog,
  templates: FileText,
  settings: Settings,
};

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  userRole: Role;
  /** Called when a client result is selected */
  onSelectClient?: (clientId: string) => void;
}

export default function CommandPalette({
  open,
  onClose,
  userRole,
  onSelectClient,
}: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    clients: SearchResult[];
    events: SearchResult[];
    users: SearchResult[];
  }>({ clients: [], events: [], users: [] });
  const [activeIndex, setActiveIndex] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filtered nav items based on role
  const navResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return NAV_ITEMS.filter(
      (item) =>
        item.roles.includes(userRole) &&
        (item.label.toLowerCase().includes(q) ||
          item.key.toLowerCase().includes(q))
    )
      .slice(0, 5)
      .map(
        (item): SearchResult => ({
          id: `nav-${item.key}`,
          type: "nav",
          title: item.label,
          subtitle: `/${item.key}`,
          icon: item.icon,
          href: `/${item.key}`,
        })
      );
  }, [query, userRole]);

  // All results flattened for keyboard nav
  const allResults = useMemo(() => {
    return [
      ...results.clients,
      ...results.events,
      ...results.users,
      ...navResults,
    ];
  }, [results, navResults]);

  // Debounced search
  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults({ clients: [], events: [], users: [] });
      setActiveIndex(0);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const data = await globalSearch(query);
      setResults(data);
      setActiveIndex(0);
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open]);

  // Reset on open/close
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults({ clients: [], events: [], users: [] });
      setActiveIndex(0);
      // Focus input after animation
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Body scroll lock + Escape
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      onClose();
      if (result.type === "client" && result.clientId) {
        if (onSelectClient) {
          onSelectClient(result.clientId);
        } else {
          router.push(`/clients?open=${result.clientId}`);
        }
      } else if (result.type === "event" && result.date) {
        router.push(`/calendar?date=${result.date}`);
      } else if (result.href) {
        router.push(result.href);
      }
    },
    [onClose, onSelectClient, router]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, allResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && allResults[activeIndex]) {
      e.preventDefault();
      handleSelect(allResults[activeIndex]);
    }
  }

  if (!open) return null;

  const hasResults =
    results.clients.length > 0 ||
    results.events.length > 0 ||
    results.users.length > 0 ||
    navResults.length > 0;

  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-[80]">
      {/* Backdrop — hidden on mobile (fullscreen modal) */}
      <div
        className="hidden md:block absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "absolute bg-surface flex flex-col overflow-hidden",
          // Mobile: fullscreen
          "inset-0",
          // Desktop: centered modal
          "md:inset-auto md:top-[15%] md:left-1/2 md:-translate-x-1/2 md:w-[min(560px,95vw)] md:max-h-[70dvh] md:rounded-[16px] md:shadow-lg md:border md:border-border"
        )}
        style={{ animation: "modal-in 0.2s ease-out" }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
          <Search size={18} className="text-text-dim shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hledat klienty, události, stránky..."
            className="flex-1 min-w-0 text-sm text-text placeholder:text-text-faint bg-transparent outline-none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-[8px] text-text-dim hover:text-text hover:bg-surface-hover transition-colors md:hidden"
            aria-label="Zavřít"
          >
            <X size={18} />
          </button>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[4px] bg-surface-hover border border-border text-[10px] font-medium text-text-dim">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto py-2">
          {query.trim() && !hasResults && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-text-dim">
                Žádné výsledky pro &ldquo;{query}&rdquo;
              </p>
            </div>
          )}

          {!query.trim() && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-text-dim">
                Začněte psát pro vyhledávání...
              </p>
            </div>
          )}

          {/* Clients */}
          {results.clients.length > 0 && (
            <ResultGroup label="Klienti">
              {results.clients.map((r) => {
                const idx = flatIndex++;
                return (
                  <ResultItem
                    key={r.id}
                    result={r}
                    active={idx === activeIndex}
                    onSelect={handleSelect}
                    onHover={() => setActiveIndex(idx)}
                  />
                );
              })}
            </ResultGroup>
          )}

          {/* Events */}
          {results.events.length > 0 && (
            <ResultGroup label="Události">
              {results.events.map((r) => {
                const idx = flatIndex++;
                return (
                  <ResultItem
                    key={r.id}
                    result={r}
                    active={idx === activeIndex}
                    onSelect={handleSelect}
                    onHover={() => setActiveIndex(idx)}
                  />
                );
              })}
            </ResultGroup>
          )}

          {/* Users */}
          {results.users.length > 0 && (
            <ResultGroup label="Uživatelé">
              {results.users.map((r) => {
                const idx = flatIndex++;
                return (
                  <ResultItem
                    key={r.id}
                    result={r}
                    active={idx === activeIndex}
                    onSelect={handleSelect}
                    onHover={() => setActiveIndex(idx)}
                  />
                );
              })}
            </ResultGroup>
          )}

          {/* Navigation */}
          {navResults.length > 0 && (
            <ResultGroup label="Navigace">
              {navResults.map((r) => {
                const idx = flatIndex++;
                return (
                  <ResultItem
                    key={r.id}
                    result={r}
                    active={idx === activeIndex}
                    onSelect={handleSelect}
                    onHover={() => setActiveIndex(idx)}
                    navIcon={NAV_ICON_MAP[r.href?.slice(1) || ""]}
                  />
                );
              })}
            </ResultGroup>
          )}
        </div>

        {/* Footer hint */}
        <div className="hidden md:flex items-center gap-4 px-4 py-2 border-t border-border text-[11px] text-text-dim shrink-0">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-surface-hover border border-border text-[10px]">↑↓</kbd>
            navigace
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-surface-hover border border-border text-[10px]">↵</kbd>
            otevřít
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-surface-hover border border-border text-[10px]">esc</kbd>
            zavřít
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ResultGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-1">
      <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-dim">
        {label}
      </p>
      {children}
    </div>
  );
}

function ResultItem({
  result,
  active,
  onSelect,
  onHover,
  navIcon: NavIcon,
}: {
  result: SearchResult;
  active: boolean;
  onSelect: (r: SearchResult) => void;
  onHover: () => void;
  navIcon?: LucideIcon;
}) {
  return (
    <button
      onClick={() => onSelect(result)}
      onMouseEnter={onHover}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 min-h-[44px] text-left transition-colors",
        active ? "bg-gold/8 text-text" : "text-text hover:bg-surface-hover"
      )}
    >
      {NavIcon ? (
        <NavIcon size={16} className="text-text-dim shrink-0" />
      ) : (
        <span className="text-sm shrink-0">{result.icon}</span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{result.title}</p>
        {result.subtitle && (
          <p className="text-xs text-text-dim truncate">{result.subtitle}</p>
        )}
      </div>
      {active && (
        <kbd className="hidden md:inline-flex px-1.5 py-0.5 rounded bg-surface-hover border border-border text-[10px] text-text-dim shrink-0">
          ↵
        </kbd>
      )}
    </button>
  );
}
