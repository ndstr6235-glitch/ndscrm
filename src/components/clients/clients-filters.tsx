"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";

interface ClientsFiltersProps {
  brokers: { id: string; name: string }[];
  isBroker: boolean;
}

export default function ClientsFilters({ brokers, isBroker }: ClientsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("q") ?? "";
  const currentStatus = searchParams.get("status") ?? "all";
  const currentBroker = searchParams.get("broker") ?? "all";

  const [searchValue, setSearchValue] = useState(currentSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build new URL from params
  const buildUrl = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams]
  );

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const trimmed = searchValue.trim();
      if (trimmed !== currentSearch) {
        router.push(buildUrl({ q: trimmed }));
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchValue, currentSearch, router, buildUrl]);

  function handleStatus(value: string) {
    router.push(buildUrl({ status: value }));
  }

  function handleBroker(value: string) {
    router.push(buildUrl({ broker: value }));
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-0">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none"
        />
        <input
          type="text"
          placeholder="Hledat jméno, email, telefon..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
        />
      </div>

      {/* Status filter */}
      <div className="relative">
        <select
          value={currentStatus}
          onChange={(e) => handleStatus(e.target.value)}
          className="appearance-none w-full sm:w-auto pl-3 pr-8 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition cursor-pointer"
        >
          <option value="all">Vše</option>
          <option value="investor">Investor</option>
          <option value="prospect">Prospect</option>
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none"
        />
      </div>

      {/* Broker filter (admin/supervisor only) */}
      {!isBroker && brokers.length > 0 && (
        <div className="relative">
          <select
            value={currentBroker}
            onChange={(e) => handleBroker(e.target.value)}
            className="appearance-none w-full sm:w-auto pl-3 pr-8 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition cursor-pointer"
          >
            <option value="all">Všichni brokeři</option>
            {brokers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none"
          />
        </div>
      )}
    </div>
  );
}
