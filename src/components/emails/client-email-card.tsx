import { AlertTriangle } from "lucide-react";
import { cn, fmtCZK } from "@/lib/utils";

interface EmailClientRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isInvestor: boolean;
  totalDeposit: number;
}

interface EmailTemplate {
  id: string;
  label: string;
}

interface ClientEmailCardProps {
  client: EmailClientRow;
  templates: EmailTemplate[];
  onSelectTemplate: (clientId: string, templateId: string) => void;
}

export default function ClientEmailCard({
  client,
  templates,
  onSelectTemplate,
}: ClientEmailCardProps) {
  const hasEmail = !!client.email;

  return (
    <div className="bg-surface rounded-[16px] border border-border p-4 space-y-3 hover:shadow-md transition-shadow">
      {/* Client info row */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-sm font-bold text-gold shrink-0">
          {client.firstName[0]}
          {client.lastName[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text truncate">
            {client.firstName} {client.lastName}
          </p>
          <p className="text-xs text-text-dim truncate">
            {client.email || "Bez emailu"}
          </p>
        </div>
        {/* Status badge */}
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide shrink-0",
            client.isInvestor
              ? "bg-emerald-pale text-emerald border border-emerald-border"
              : "bg-sapphire-pale text-sapphire border border-sapphire-border"
          )}
        >
          {client.isInvestor ? "Investor" : "Prospect"}
        </span>
      </div>

      {/* Deposit */}
      {client.totalDeposit > 0 && (
        <p className="text-xs text-text-mid">
          Vklad: <span className="font-semibold text-emerald">{fmtCZK(client.totalDeposit)}</span>
        </p>
      )}

      {/* No email warning */}
      {!hasEmail && (
        <div className="flex items-center gap-1.5 text-xs text-amber">
          <AlertTriangle size={12} />
          Klient nemá vyplněný email
        </div>
      )}

      {/* Template pills */}
      <div className="flex gap-1.5 flex-wrap">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(client.id, template.id)}
            disabled={!hasEmail}
            className={cn(
              "px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors",
              hasEmail
                ? "bg-surface-hover text-text-mid hover:bg-gold hover:text-white"
                : "bg-surface-hover text-text-faint cursor-not-allowed"
            )}
          >
            {template.label}
          </button>
        ))}
      </div>
    </div>
  );
}
