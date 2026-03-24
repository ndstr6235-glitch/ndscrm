"use client";

import { useState, useCallback } from "react";
import { UserPlus, List, Columns3 } from "lucide-react";
import { cn } from "@/lib/utils";
import ClientsFilters from "./clients-filters";
import ClientsTable from "./clients-table";
import ClientsCards from "./clients-cards";
import ClientsEmpty from "./clients-empty";
import ClientDrawer from "./client-drawer";
import ClientForm from "./client-form";
import PipelineBoard from "./pipeline-board";
import BulkActionBar from "./bulk-action-bar";

export interface ClientRow {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  callDate: string;
  isInvestor: boolean;
  totalDeposit: number;
  totalProfit: number;
  brokerName: string;
  brokerId: string;
  stage: string;
  score: string;
}

interface ClientsPageClientProps {
  clients: ClientRow[];
  brokers: { id: string; name: string }[];
  isBroker: boolean;
  userRole: "administrator" | "supervisor" | "broker";
  totalCount: number;
  hasFilters: boolean;
}

export default function ClientsPageClient({
  clients,
  brokers,
  isBroker,
  userRole,
  totalCount,
  hasFilters,
}: ClientsPageClientProps) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [view, setView] = useState<"list" | "pipeline">("list");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  const canBulk = userRole !== "broker";

  function handleClientClick(id: string) {
    if (selectMode) {
      toggleSelect(id);
    } else {
      setSelectedClientId(id);
    }
  }

  function handleCreateSuccess() {
    // revalidatePath in server action handles refresh
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      // Exit select mode if nothing selected
      if (next.size === 0) setSelectMode(false);
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === clients.length) {
      setSelectedIds(new Set());
      setSelectMode(false);
    } else {
      setSelectedIds(new Set(clients.map((c) => c.id)));
      setSelectMode(true);
    }
  }

  function clearSelection() {
    setSelectedIds(new Set());
    setSelectMode(false);
  }

  const handleEnterSelectMode = useCallback(
    (id: string) => {
      setSelectMode(true);
      setSelectedIds(new Set([id]));
    },
    []
  );

  function handleBulkDone() {
    clearSelection();
    // Page will refresh via revalidatePath
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl md:text-2xl font-bold text-text">
            Klienti
          </h1>
          <p className="mt-0.5 text-sm text-text-mid">
            {totalCount}{" "}
            {totalCount === 1
              ? "klient"
              : totalCount < 5
                ? "klienti"
                : "klientů"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-[8px] border border-border overflow-hidden">
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex items-center justify-center w-11 h-11 md:w-9 md:h-9 transition-colors",
                view === "list" ? "bg-gold text-white" : "bg-surface text-text-dim hover:bg-surface-hover"
              )}
              aria-label="Seznam"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setView("pipeline")}
              className={cn(
                "flex items-center justify-center w-11 h-11 md:w-9 md:h-9 transition-colors",
                view === "pipeline" ? "bg-gold text-white" : "bg-surface text-text-dim hover:bg-surface-hover"
              )}
              aria-label="Pipeline"
            >
              <Columns3 size={16} />
            </button>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-gradient-to-r from-gold to-gold-light text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
          >
            <UserPlus size={16} />
            <span className="hidden sm:inline">Pridat klienta</span>
          </button>
        </div>
      </div>

      {/* Filters (list view only) */}
      {view === "list" && (
        <ClientsFilters brokers={brokers} isBroker={isBroker} />
      )}

      {/* Content */}
      {view === "pipeline" ? (
        <PipelineBoard
          clients={clients.map((c) => ({
            id: c.id,
            firstName: c.firstName,
            lastName: c.lastName,
            stage: c.stage,
            score: c.score as "A" | "B" | "C" | "D",
            totalDeposit: c.totalDeposit,
            brokerName: c.brokerName,
          }))}
          onSelectClient={handleClientClick}
        />
      ) : clients.length === 0 ? (
        <ClientsEmpty hasFilters={hasFilters} />
      ) : (
        <>
          <ClientsTable
            clients={clients}
            isBroker={isBroker}
            onClientClick={handleClientClick}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleAll={toggleAll}
            showCheckboxes={canBulk}
          />
          <ClientsCards
            clients={clients}
            isBroker={isBroker}
            onClientClick={handleClientClick}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            selectMode={selectMode}
            onEnterSelectMode={handleEnterSelectMode}
            showCheckboxes={canBulk}
          />
        </>
      )}

      {/* Bulk action bar */}
      {canBulk && selectedIds.size > 0 && (
        <BulkActionBar
          selectedIds={Array.from(selectedIds)}
          onClear={clearSelection}
          onDone={handleBulkDone}
          brokers={brokers}
          userRole={userRole}
        />
      )}

      {/* Client Drawer */}
      <ClientDrawer
        clientId={selectedClientId}
        onClose={() => setSelectedClientId(null)}
        brokers={brokers}
        isBroker={isBroker}
        userRole={userRole}
      />

      {/* Create Client Form */}
      <ClientForm
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={handleCreateSuccess}
        brokers={brokers}
        isBroker={isBroker}
      />
    </div>
  );
}
