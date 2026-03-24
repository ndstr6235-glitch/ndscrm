"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Modal from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { createClient, updateClient } from "@/app/actions/clients";
import { PIPELINE_STAGES } from "@/lib/constants";
import type { ClientDetail } from "@/app/actions/clients";
import type { ClientStage } from "@/lib/types";

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  brokers: { id: string; name: string }[];
  isBroker: boolean;
  editData?: ClientDetail | null;
}

export default function ClientForm({
  open,
  onClose,
  onSuccess,
  brokers,
  isBroker,
  editData,
}: ClientFormProps) {
  const { toast } = useToast();
  const isEdit = !!editData;

  const [firstName, setFirstName] = useState(editData?.firstName ?? "");
  const [lastName, setLastName] = useState(editData?.lastName ?? "");
  const [phone, setPhone] = useState(editData?.phone ?? "");
  const [email, setEmail] = useState(editData?.email ?? "");
  const [callDate, setCallDate] = useState(
    editData?.callDate ?? new Date().toISOString().split("T")[0]
  );
  const [nextPaymentDate, setNextPaymentDate] = useState(
    editData?.nextPaymentDate ?? new Date().toISOString().split("T")[0]
  );
  const [paymentFreq, setPaymentFreq] = useState(editData?.paymentFreq ?? 30);
  const [stage, setStage] = useState(editData?.stage ?? "NEW");
  const [assignedTo, setAssignedTo] = useState(editData?.brokerId ?? "");
  const [note, setNote] = useState(editData?.note ?? "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reset form when modal opens or editData changes
  /* eslint-disable react-hooks/set-state-in-effect -- intentional form reset on open */
  useEffect(() => {
    if (open) {
      setFirstName(editData?.firstName ?? "");
      setLastName(editData?.lastName ?? "");
      setPhone(editData?.phone ?? "");
      setEmail(editData?.email ?? "");
      setCallDate(
        editData?.callDate ?? new Date().toISOString().split("T")[0]
      );
      setNextPaymentDate(
        editData?.nextPaymentDate ?? new Date().toISOString().split("T")[0]
      );
      setPaymentFreq(editData?.paymentFreq ?? 30);
      setStage(editData?.stage ?? "NEW");
      setAssignedTo(editData?.brokerId ?? "");
      setNote(editData?.note ?? "");
      setError("");
    }
  }, [open, editData]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim()) {
      setError("Jméno a příjmení jsou povinné");
      return;
    }

    setSubmitting(true);

    const formData = {
      firstName,
      lastName,
      phone,
      email,
      callDate,
      nextPaymentDate,
      paymentFreq,
      note,
      assignedTo,
      stage,
    };

    const result = isEdit
      ? await updateClient(editData!.id, formData)
      : await createClient(formData);

    setSubmitting(false);

    if (result.success) {
      toast(isEdit ? "Klient upraven" : "Klient vytvořen");
      onSuccess();
      onClose();
    } else {
      toast(result.error || "Nepodařilo se uložit", "error");
      setError(result.error || "Nastala chyba");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Upravit klienta" : "Nový klient"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-mid mb-1">
              Jméno *
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-mid mb-1">
              Příjmení *
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
              required
            />
          </div>
        </div>

        {/* Contact */}
        <div>
          <label className="block text-xs font-medium text-text-mid mb-1">
            Telefon
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+420 777 123 456"
            className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-mid mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.cz"
            className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-mid mb-1">
              Datum hovoru
            </label>
            <input
              type="date"
              value={callDate}
              onChange={(e) => setCallDate(e.target.value)}
              className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-mid mb-1">
              Příští platba
            </label>
            <input
              type="date"
              value={nextPaymentDate}
              onChange={(e) => setNextPaymentDate(e.target.value)}
              className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
            />
          </div>
        </div>

        {/* Freq */}
        <div>
          <label className="block text-xs font-medium text-text-mid mb-1">
            Frekvence plateb (dny)
          </label>
          <input
            type="number"
            min={1}
            value={paymentFreq}
            onChange={(e) => setPaymentFreq(parseInt(e.target.value) || 30)}
            className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
          />
        </div>

        {/* Stage */}
        {isEdit && (
          <div>
            <label className="block text-xs font-medium text-text-mid mb-1">
              Stage
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as ClientStage)}
              className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
            >
              {PIPELINE_STAGES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Broker (admin/supervisor only) */}
        {!isBroker && brokers.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-text-mid mb-1">
              Přiřazený broker
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
            >
              <option value="">Vyberte brokera</option>
              {brokers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Note */}
        <div>
          <label className="block text-xs font-medium text-text-mid mb-1">
            Poznámka
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 rounded-[10px] border border-border bg-surface text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition resize-none"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-ruby bg-ruby-pale border border-ruby-border rounded-[8px] px-3 py-2">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-[10px] bg-gradient-to-r from-gold to-gold-light text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow disabled:opacity-60"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {isEdit ? "Uložit změny" : "Vytvořit klienta"}
        </button>
      </form>
    </Modal>
  );
}
