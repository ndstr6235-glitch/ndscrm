"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import ClientsFilters from "./clients-filters";
import ClientsTable from "./clients-table";
import ClientsCards from "./clients-cards";
import ClientsEmpty from "./clients-empty";
import ClientDrawer from "./client-drawer";
import ClientForm from "./client-form";

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

  function handleClientClick(id: string) {
    setSelectedClientId(id);
  }

  function handleCreateSuccess() {
    // revalidatePath in server action handles refresh
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
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-gradient-to-r from-gold to-gold-light text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
        >
          <UserPlus size={16} />
          <span className="hidden sm:inline">Přidat klienta</span>
        </button>
      </div>

      {/* Filters */}
      <ClientsFilters brokers={brokers} isBroker={isBroker} />

      {/* Content */}
      {clients.length === 0 ? (
        <ClientsEmpty hasFilters={hasFilters} />
      ) : (
        <>
          <ClientsTable
            clients={clients}
            isBroker={isBroker}
            onClientClick={handleClientClick}
          />
          <ClientsCards
            clients={clients}
            isBroker={isBroker}
            onClientClick={handleClientClick}
          />
        </>
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
