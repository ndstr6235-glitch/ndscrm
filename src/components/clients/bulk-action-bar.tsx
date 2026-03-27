"use client";

import { useState } from "react";
import {
  Mail,
  UserCog,
  ArrowRightLeft,
  Download,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import {
  bulkAssignBroker,
  bulkChangeStage,
  bulkDelete,
  bulkExportCSV,
} from "@/app/actions/bulk";
import { PIPELINE_STAGES } from "@/lib/constants";
import ConfirmDialog from "@/components/ui/confirm-dialog";

interface BulkActionBarProps {
  selectedIds: string[];
  onClear: () => void;
  onDone: () => void;
  brokers: { id: string; name: string }[];
  userRole: "administrator" | "supervisor" | "broker";
}

export default function BulkActionBar({
  selectedIds,
  onClear,
  onDone,
  brokers,
  userRole,
}: BulkActionBarProps) {
  const { toast } = useToast();
  const [showBrokerDropdown, setShowBrokerDropdown] = useState(false);
  const [showStageDropdown, setShowStageDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const count = selectedIds.length;
  if (count === 0) return null;

  async function handleAssignBroker(brokerId: string) {
    setLoading(true);
    setShowBrokerDropdown(false);
    const result = await bulkAssignBroker(selectedIds, brokerId);
    setLoading(false);
    if (result.error) {
      toast(result.error, "error");
    } else {
      toast(`${result.count} klientů přiřazeno`);
      onDone();
    }
  }

  async function handleChangeStage(stage: string) {
    setLoading(true);
    setShowStageDropdown(false);
    const result = await bulkChangeStage(selectedIds, stage);
    setLoading(false);
    if (result.error) {
      toast(result.error, "error");
    } else {
      toast(`Stage změněn u ${result.count} klientů`);
      onDone();
    }
  }

  async function handleExportCSV() {
    setLoading(true);
    const result = await bulkExportCSV(selectedIds);
    setLoading(false);
    if (result.error) {
      toast(result.error, "error");
    } else if (result.csv) {
      const blob = new Blob(["\uFEFF" + result.csv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `klienti-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast("CSV exportováno");
    }
  }

  async function handleDelete() {
    setLoading(true);
    setShowDeleteConfirm(false);
    const result = await bulkDelete(selectedIds);
    setLoading(false);
    if (result.error) {
      toast(result.error, "error");
    } else {
      toast(`${result.count} klientů smazáno`);
      onDone();
    }
  }

  function handleEmailClick() {
    const emails = selectedIds.join(",");
    window.location.href = `/emails?bulk=${emails}`;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-[55] p-3 md:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-4xl mx-auto bg-sidebar text-white rounded-[14px] shadow-lg border border-white/10 px-4 py-3 flex items-center gap-3 flex-wrap">
          {/* Count + close */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-semibold">
              Vybrano {count}{" "}
              {count === 1 ? "klient" : count < 5 ? "klienti" : "klientů"}
            </span>
            <button
              onClick={onClear}
              className="w-11 h-11 md:w-7 md:h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {loading && (
            <Loader2 size={16} className="animate-spin text-gold shrink-0" />
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 flex-wrap ml-auto">
            {/* Email */}
            <button
              onClick={handleEmailClick}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] md:min-h-0 rounded-[8px] text-xs font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <Mail size={14} />
              <span className="hidden sm:inline">Email</span>
            </button>

            {/* Assign broker */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowBrokerDropdown(!showBrokerDropdown);
                  setShowStageDropdown(false);
                }}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] md:min-h-0 rounded-[8px] text-xs font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                <UserCog size={14} />
                <span className="hidden sm:inline">Broker</span>
              </button>
              {showBrokerDropdown && (
                <div className="absolute bottom-full mb-2 left-0 w-48 bg-surface border border-border rounded-[10px] shadow-lg overflow-hidden z-10">
                  {brokers.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => handleAssignBroker(b.id)}
                      className="w-full text-left px-3 py-2.5 min-h-[44px] text-sm text-text hover:bg-surface-hover transition-colors"
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Change stage */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowStageDropdown(!showStageDropdown);
                  setShowBrokerDropdown(false);
                }}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] md:min-h-0 rounded-[8px] text-xs font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                <ArrowRightLeft size={14} />
                <span className="hidden sm:inline">Stage</span>
              </button>
              {showStageDropdown && (
                <div className="absolute bottom-full mb-2 left-0 w-48 bg-surface border border-border rounded-[10px] shadow-lg overflow-hidden z-10">
                  {PIPELINE_STAGES.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => handleChangeStage(s.key)}
                      className="w-full text-left px-3 py-2.5 min-h-[44px] text-sm text-text hover:bg-surface-hover transition-colors flex items-center gap-2"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] md:min-h-0 rounded-[8px] text-xs font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <Download size={14} />
              <span className="hidden sm:inline">CSV</span>
            </button>

            {/* Delete (admin only) */}
            {userRole === "administrator" && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] md:min-h-0 rounded-[8px] text-xs font-medium text-ruby hover:bg-ruby/10 transition-colors disabled:opacity-50"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">Smazat</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        title={`Smazat ${count} klientů?`}
        message="Tato akce je nevratná. Všichni vybraní klienti a jejich data budou smazáni."
        confirmLabel="Smazat"
        destructive
      />
    </>
  );
}
