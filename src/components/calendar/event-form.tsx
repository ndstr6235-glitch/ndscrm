"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import Modal from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { EVENT_TYPES } from "@/lib/constants";
import { createEvent } from "@/app/actions/calendar";
import type { EventType } from "@/lib/types";

const ALL_TYPES: EventType[] = ["call", "payment", "reminder", "interest", "meeting"];

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultDate?: string;
  clients: { id: string; name: string }[];
}

export default function EventForm({
  open,
  onClose,
  onSuccess,
  defaultDate,
  clients,
}: EventFormProps) {
  const { toast } = useToast();
  const [type, setType] = useState<string>("call");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(
    defaultDate || new Date().toISOString().split("T")[0]
  );
  const [time, setTime] = useState("09:00");
  const [clientId, setClientId] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Název je povinný");
      return;
    }

    setSubmitting(true);

    const result = await createEvent({
      type,
      title,
      date,
      time,
      clientId: clientId || undefined,
      note,
    });

    setSubmitting(false);

    if (result.success) {
      toast("Událost vytvořena");
      setTitle("");
      setNote("");
      setClientId("");
      onSuccess();
      onClose();
    } else {
      toast(result.error || "Nepodařilo se vytvořit událost", "error");
      setError(result.error || "Nastala chyba");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nová událost">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Event type */}
        <div>
          <label className="block text-xs font-medium text-text-mid mb-1">
            Typ události
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
          >
            {ALL_TYPES.map((t) => (
              <option key={t} value={t}>
                {EVENT_TYPES[t].icon} {EVENT_TYPES[t].label}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-text-mid mb-1">
            Název *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Hovor s klientem..."
            className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
            required
          />
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-mid mb-1">
              Datum
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-mid mb-1">
              Čas
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
            />
          </div>
        </div>

        {/* Client */}
        {clients.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-text-mid mb-1">
              Klient (volitelné)
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
            >
              <option value="">Bez klienta</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
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
            rows={2}
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
          Vytvořit událost
        </button>
      </form>
    </Modal>
  );
}
