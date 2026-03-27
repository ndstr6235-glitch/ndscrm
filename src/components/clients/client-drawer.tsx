"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { getClientDetail, deleteClient, type ClientDetail } from "@/app/actions/clients";
import DrawerHeader from "./drawer-header";
import DrawerTabs from "./drawer-tabs";
import DrawerTabOverview from "./drawer-tab-overview";
import DrawerTabPayments from "./drawer-tab-payments";
import DrawerTabEvents from "./drawer-tab-events";
import DrawerTabEmail from "./drawer-tab-email";
import DrawerTabHistory from "./drawer-tab-history";
import DrawerTabDocuments from "./drawer-tab-documents";
import DrawerFooter from "./drawer-footer";
import ClientForm from "./client-form";
import PaymentForm from "./payment-form";
import ConfirmDialog from "@/components/ui/confirm-dialog";

interface ClientDrawerProps {
  clientId: string | null;
  onClose: () => void;
  brokers: { id: string; name: string }[];
  isBroker: boolean;
  userRole: "administrator" | "supervisor" | "broker";
}

type Tab = "overview" | "payments" | "events" | "email" | "history" | "documents";

export default function ClientDrawer({
  clientId,
  onClose,
  brokers,
  isBroker,
  userRole,
}: ClientDrawerProps) {
  const { toast } = useToast();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isClosing, setIsClosing] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const touchStartX = useRef(0);

  // Fetch / refresh client detail
  const fetchClient = useCallback(async (id: string) => {
    setLoading(true);
    const data = await getClientDetail(id);
    setClient(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!clientId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting state on prop change is intentional
      setClient(null);
      return;
    }
    setActiveTab("overview");
    fetchClient(clientId);
  }, [clientId, fetchClient]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  }, [onClose]);

  useEffect(() => {
    if (!clientId) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [clientId, handleClose]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 50) handleClose();
  }

  function handleFormSuccess() {
    if (clientId) fetchClient(clientId);
  }

  async function handleDeleteConfirm() {
    if (!clientId) return;
    const result = await deleteClient(clientId);
    if (result.success) {
      toast("Klient smazán");
      setShowDeleteConfirm(false);
      onClose();
    } else {
      toast(result.error || "Nepodařilo se smazat klienta", "error");
    }
  }

  if (!clientId) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200",
          isClosing ? "opacity-0" : "opacity-100"
        )}
        onClick={handleClose}
      />

      {/* Drawer panel */}
      <aside
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={cn(
          "absolute right-0 top-0 bottom-0 bg-surface flex flex-col shadow-lg overflow-hidden",
          "w-full md:w-[min(540px,95vw)] lg:w-[min(640px,95vw)]",
          "pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]",
          isClosing ? "animate-drawer-out" : "animate-drawer-in"
        )}
        style={
          isClosing
            ? { animation: "drawer-out 0.2s ease-in forwards" }
            : undefined
        }
      >
        {loading || !client ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-text-dim">Načítám...</span>
            </div>
          </div>
        ) : (
          <>
            <DrawerHeader client={client} onClose={handleClose} />

            <DrawerTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              paymentCount={client.payments.length}
              eventCount={client.events.length}
              showDocuments={userRole !== "broker"}
            />

            <div className="flex-1 overflow-y-auto">
              {activeTab === "overview" && (
                <DrawerTabOverview
                  client={client}
                  onEdit={() => setShowClientForm(true)}
                  onDelete={() => setShowDeleteConfirm(true)}
                />
              )}
              {activeTab === "payments" && (
                <DrawerTabPayments
                  client={client}
                  onAddPayment={() => setShowPaymentForm(true)}
                />
              )}
              {activeTab === "events" && (
                <DrawerTabEvents client={client} />
              )}
              {activeTab === "email" && (
                <DrawerTabEmail client={client} userRole={userRole} />
              )}
              {activeTab === "documents" && userRole !== "broker" && (
                <DrawerTabDocuments clientId={client.id} />
              )}
              {activeTab === "history" && (
                <DrawerTabHistory clientId={client.id} />
              )}
            </div>

            <DrawerFooter
              onSwitchTab={(tab) => {
                if (tab === "payments") {
                  setShowPaymentForm(true);
                } else {
                  setActiveTab(tab);
                }
              }}
            />
          </>
        )}
      </aside>

      {/* ClientForm modal */}
      <ClientForm
        open={showClientForm}
        onClose={() => setShowClientForm(false)}
        onSuccess={handleFormSuccess}
        brokers={brokers}
        isBroker={isBroker}
        editData={client}
      />

      {/* PaymentForm modal */}
      {client && (
        <PaymentForm
          open={showPaymentForm}
          onClose={() => setShowPaymentForm(false)}
          onSuccess={handleFormSuccess}
          clientId={client.id}
          clientName={`${client.firstName} ${client.lastName}`}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        title="Smazat klienta?"
        message={
          client
            ? `Opravdu chcete smazat klienta ${client.firstName} ${client.lastName}? Tato akce je nevratná.`
            : "Opravdu chcete smazat tohoto klienta?"
        }
        confirmLabel="Smazat"
        destructive
      />
    </div>
  );
}
