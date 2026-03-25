"use client";

import { Phone, Mail, CalendarDays, CreditCard, Pencil, Trash2 } from "lucide-react";
import { fmtDate } from "@/lib/utils";
import type { ClientDetail } from "@/app/actions/clients";

interface DrawerTabOverviewProps {
  client: ClientDetail;
  onEdit: () => void;
  onDelete: () => void;
}

export default function DrawerTabOverview({
  client,
  onEdit,
  onDelete,
}: DrawerTabOverviewProps) {
  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Contact grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoCard
          icon={<Phone size={14} className="text-text-dim" />}
          label="Telefon"
          value={client.phone}
        />
        <InfoCard
          icon={<Mail size={14} className="text-text-dim" />}
          label="Email"
          value={client.email}
        />
        <InfoCard
          icon={<CalendarDays size={14} className="text-text-dim" />}
          label="Datum hovoru"
          value={fmtDate(client.callDate)}
        />
        <InfoCard
          icon={<CreditCard size={14} className="text-text-dim" />}
          label="Příští platba"
          value={fmtDate(client.nextPaymentDate)}
        />
      </div>

      {/* Note */}
      <div className="rounded-[12px] border-2 border-gold-border bg-gold-pale p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-text-mid uppercase tracking-wider">
            Poznámka
          </span>
          <button
            onClick={onEdit}
            className="text-text-dim hover:text-gold transition-colors"
          >
            <Pencil size={14} />
          </button>
        </div>
        <p className="text-sm text-text leading-relaxed">
          {client.note || "Žádná poznámka"}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] border border-border text-sm font-medium text-text-mid hover:text-text hover:bg-surface-hover transition-colors"
        >
          <Pencil size={14} />
          Upravit klienta
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] border border-ruby-border text-sm font-medium text-ruby hover:bg-ruby-pale transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-surface-hover rounded-[10px] p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider text-text-dim">
          {label}
        </span>
      </div>
      <p className="text-sm font-medium text-text truncate">{value}</p>
    </div>
  );
}
