"use client";

import { useState, useTransition } from "react";
import { Shield, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAuditLogs } from "@/app/actions/audit";

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
}

interface AuditUser {
  id: string;
  firstName: string;
  lastName: string;
}

interface Props {
  initialData: {
    logs: AuditLog[];
    total: number;
    hasMore: boolean;
  };
  users: AuditUser[];
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  CREATE: { label: "Vytvořeno", color: "text-emerald" },
  UPDATE: { label: "Upraveno", color: "text-sapphire" },
  DELETE: { label: "Smazáno", color: "text-ruby" },
  LOGIN: { label: "Přihlášení", color: "text-gold" },
  LOGOUT: { label: "Odhlášení", color: "text-text-mid" },
};

const ENTITY_LABELS: Record<string, string> = {
  client: "Klient",
  user: "Uživatel",
  template: "Šablona",
  event: "Událost",
  payment: "Platba",
  document: "Dokument",
};

export function AuditPageClient({ initialData, users }: Props) {
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    userId: "",
    action: "",
    entity: "",
    dateFrom: "",
    dateTo: "",
  });
  const [isPending, startTransition] = useTransition();

  const fetchPage = (newPage: number, newFilters = filters) => {
    startTransition(async () => {
      const result = await getAuditLogs({
        ...newFilters,
        userId: newFilters.userId || undefined,
        action: newFilters.action || undefined,
        entity: newFilters.entity || undefined,
        dateFrom: newFilters.dateFrom || undefined,
        dateTo: newFilters.dateTo || undefined,
        page: newPage,
      });
      setData(result);
      setPage(newPage);
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchPage(1, newFilters);
  };

  const totalPages = Math.ceil(data.total / 20);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-gold" />
        <h1 className="text-xl lg:text-2xl font-bold font-display">Audit Log</h1>
        <span className="text-sm text-text-mid ml-2">({data.total} záznamů)</span>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-[16px] shadow-card p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-text-dim" />
          <span className="text-sm font-medium text-text-mid">Filtry</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* User */}
          <select
            value={filters.userId}
            onChange={(e) => handleFilterChange("userId", e.target.value)}
            className="px-3 py-2 rounded-[10px] border border-border bg-surface text-sm min-h-[44px] focus:border-gold focus:ring-1 focus:ring-gold/50 outline-none"
          >
            <option value="">Všichni uživatelé</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.firstName} {u.lastName}
              </option>
            ))}
          </select>

          {/* Action */}
          <select
            value={filters.action}
            onChange={(e) => handleFilterChange("action", e.target.value)}
            className="px-3 py-2 rounded-[10px] border border-border bg-surface text-sm min-h-[44px] focus:border-gold focus:ring-1 focus:ring-gold/50 outline-none"
          >
            <option value="">Všechny akce</option>
            {Object.entries(ACTION_LABELS).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {/* Entity */}
          <select
            value={filters.entity}
            onChange={(e) => handleFilterChange("entity", e.target.value)}
            className="px-3 py-2 rounded-[10px] border border-border bg-surface text-sm min-h-[44px] focus:border-gold focus:ring-1 focus:ring-gold/50 outline-none"
          >
            <option value="">Všechny entity</option>
            {Object.entries(ENTITY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {/* Date from */}
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
            className="px-3 py-2 rounded-[10px] border border-border bg-surface text-sm min-h-[44px] focus:border-gold focus:ring-1 focus:ring-gold/50 outline-none"
            placeholder="Od"
          />

          {/* Date to */}
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange("dateTo", e.target.value)}
            className="px-3 py-2 rounded-[10px] border border-border bg-surface text-sm min-h-[44px] focus:border-gold focus:ring-1 focus:ring-gold/50 outline-none"
            placeholder="Do"
          />
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-surface rounded-[16px] shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 text-xs font-medium text-text-dim uppercase">Čas</th>
              <th className="px-4 py-3 text-xs font-medium text-text-dim uppercase">Uživatel</th>
              <th className="px-4 py-3 text-xs font-medium text-text-dim uppercase">Akce</th>
              <th className="px-4 py-3 text-xs font-medium text-text-dim uppercase">Entity</th>
              <th className="px-4 py-3 text-xs font-medium text-text-dim uppercase">Detail</th>
            </tr>
          </thead>
          <tbody>
            {data.logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-text-dim text-sm">
                  Žádné záznamy
                </td>
              </tr>
            ) : (
              data.logs.map((log) => {
                const actionMeta = ACTION_LABELS[log.action] ?? { label: log.action, color: "text-text-mid" };
                return (
                  <tr key={log.id} className="border-t border-border/50 hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-3 text-sm text-text-mid whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("cs-CZ", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{log.userName}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-sm font-medium", actionMeta.color)}>
                        {actionMeta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-mid">
                      {ENTITY_LABELS[log.entity] ?? log.entity}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-dim max-w-[300px] truncate">
                      {log.details ?? "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {data.logs.length === 0 ? (
          <div className="bg-surface rounded-[16px] shadow-card p-8 text-center text-text-dim text-sm">
            Žádné záznamy
          </div>
        ) : (
          data.logs.map((log) => {
            const actionMeta = ACTION_LABELS[log.action] ?? { label: log.action, color: "text-text-mid" };
            return (
              <div key={log.id} className="bg-surface rounded-[16px] shadow-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("text-sm font-medium", actionMeta.color)}>
                    {actionMeta.label}
                  </span>
                  <span className="text-xs text-text-dim">
                    {new Date(log.createdAt).toLocaleString("cs-CZ", {
                      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm font-medium">{log.userName}</p>
                <p className="text-xs text-text-mid mt-0.5">
                  {ENTITY_LABELS[log.entity] ?? log.entity}
                </p>
                {log.details && (
                  <p className="text-xs text-text-dim mt-1 line-clamp-2">{log.details}</p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => fetchPage(page - 1)}
            disabled={page <= 1 || isPending}
            className="flex items-center gap-1 px-3 py-2 rounded-[10px] border border-border text-sm font-medium text-text-mid hover:bg-surface-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
          >
            <ChevronLeft className="w-4 h-4" />
            Předchozí
          </button>
          <span className="text-sm text-text-mid">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => fetchPage(page + 1)}
            disabled={!data.hasMore || isPending}
            className="flex items-center gap-1 px-3 py-2 rounded-[10px] border border-border text-sm font-medium text-text-mid hover:bg-surface-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
          >
            Další
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
