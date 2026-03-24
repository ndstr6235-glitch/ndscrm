"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Send, Pencil, AlertTriangle, FileText } from "lucide-react";
import { cn, fmtCZK } from "@/lib/utils";
import { getCurrentUserSignature, updateSignature } from "@/app/actions/emails";
import { useToast } from "@/components/ui/toast";
import type { Role } from "@/lib/types";

interface EmailTemplate {
  id: string;
  label: string;
  subject: string;
  body: string;
  allowedRoles: string[];
}

interface EmailComposerProps {
  open: boolean;
  onClose: () => void;
  clientName: string;
  clientEmail: string;
  totalDeposit: number;
  templates: EmailTemplate[];
  userRole: Role;
  initialTemplateId?: string;
  /** Broker notes for "Smlouva" template (admin only) */
  clientNote?: string;
  brokerName?: string;
}

export default function EmailComposer({
  open,
  onClose,
  clientName,
  clientEmail,
  totalDeposit,
  templates,
  userRole,
  initialTemplateId,
  clientNote,
  brokerName,
}: EmailComposerProps) {
  const { toast } = useToast();

  // Filter templates by role
  const allowedTemplates = useMemo(
    () => templates.filter((t) => t.allowedRoles.includes(userRole)),
    [templates, userRole]
  );

  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialTemplateId || allowedTemplates[0]?.id || ""
  );
  const [salutation, setSalutation] = useState("");
  const [signature, setSignature] = useState("");
  const [editingSignature, setEditingSignature] = useState(false);
  const [bodyOverride, setBodyOverride] = useState("");
  const [loadedSignature, setLoadedSignature] = useState(false);

  // Load signature on open
  useEffect(() => {
    if (open && !loadedSignature) {
      getCurrentUserSignature().then((sig) => {
        setSignature(sig);
        setLoadedSignature(true);
      });
    }
  }, [open, loadedSignature]);

  // Reset when template or open changes
  /* eslint-disable react-hooks/set-state-in-effect -- intentional form reset on open */
  useEffect(() => {
    if (open) {
      setSelectedTemplateId(initialTemplateId || allowedTemplates[0]?.id || "");
      setSalutation("");
      setBodyOverride("");
      setLoadedSignature(false);
    }
  }, [open, initialTemplateId, allowedTemplates]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const selectedTemplate = allowedTemplates.find(
    (t) => t.id === selectedTemplateId
  );

  // Detect if selected template is "Smlouva" (admin-only contract)
  const isContractTemplate =
    selectedTemplate?.label.toLowerCase().includes("smlouva") &&
    selectedTemplate?.allowedRoles.length === 1 &&
    selectedTemplate?.allowedRoles[0] === "administrator";

  // Build email body with substitutions
  const finalBody = useMemo(() => {
    if (!selectedTemplate) return "";
    const raw = bodyOverride || selectedTemplate.body;
    return raw
      .replace(/\[OSLOVENÍ\]/g, salutation || "[OSLOVENÍ]")
      .replace(/\[PODPIS\]/g, signature || "[PODPIS]")
      .replace(/\[VKLAD\]/g, fmtCZK(totalDeposit))
      .replace(/\[CASTKA\]/g, "–");
  }, [selectedTemplate, bodyOverride, salutation, signature, totalDeposit]);

  async function handleSaveSignature() {
    const result = await updateSignature(signature);
    setEditingSignature(false);
    if (result.success) {
      toast("Podpis uložen");
    } else {
      toast("Nepodařilo se uložit podpis", "error");
    }
  }

  function handleSendMailto() {
    if (!selectedTemplate || !clientEmail) return;
    const subject = selectedTemplate.subject;
    const mailtoUrl = `mailto:${clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(finalBody)}`;
    window.open(mailtoUrl);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — fullscreen on mobile, side panel on desktop */}
      <div
        className={cn(
          "absolute bg-surface flex flex-col overflow-hidden",
          "inset-0 md:inset-y-4 md:right-4 md:left-auto md:w-[min(600px,95vw)] md:rounded-[16px] md:shadow-lg"
        )}
        style={{ animation: "modal-in 0.25s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="font-display text-lg font-bold text-text">
            Email Composer
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-[8px] text-text-dim hover:text-text hover:bg-surface-hover transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* No email warning */}
          {!clientEmail && (
            <div className="flex items-center gap-2 p-3 rounded-[10px] bg-amber-pale border border-amber text-amber text-sm">
              <AlertTriangle size={16} />
              Klient nemá vyplněný email
            </div>
          )}

          {/* Template pills — horizontal scroll on mobile */}
          <div>
            <label className="block text-xs font-medium text-text-mid mb-2">
              Šablona
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {allowedTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTemplateId(t.id);
                    setBodyOverride("");
                  }}
                  className={cn(
                    "px-3 py-2 min-h-[36px] rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0",
                    selectedTemplateId === t.id
                      ? "bg-gold text-white"
                      : "bg-surface-hover text-text-mid hover:text-text"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* To + Subject (read-only) */}
          <div className="bg-surface-hover rounded-[10px] p-3 space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-dim w-16 shrink-0">Komu:</span>
              <span className="text-text font-medium truncate">
                {clientName} &lt;{clientEmail || "—"}&gt;
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-dim w-16 shrink-0">Předmět:</span>
              <span className="text-text truncate">
                {selectedTemplate?.subject || "—"}
              </span>
            </div>
          </div>

          {/* Salutation — golden frame */}
          <div className="rounded-[10px] border-2 border-gold-border bg-gold-pale p-3">
            <label className="block text-xs font-medium text-gold mb-1">
              Oslovení
            </label>
            <input
              type="text"
              value={salutation}
              onChange={(e) => setSalutation(e.target.value)}
              placeholder='Např: "pane Nováku", "Petro"'
              autoFocus
              className="w-full px-3 py-2.5 min-h-[44px] rounded-[8px] border border-gold-border bg-surface text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/40 transition"
            />
          </div>

          {/* Podklady od brokera — only for contract template (admin only) */}
          {isContractTemplate && userRole === "administrator" && (clientNote || brokerName) && (
            <div className="rounded-[10px] border-2 border-sapphire-border bg-sapphire-pale p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <FileText size={14} className="text-sapphire" />
                <label className="text-xs font-medium text-sapphire">
                  Podklady od brokera
                </label>
              </div>
              {brokerName && (
                <div className="text-xs text-text-mid">
                  Broker: <span className="font-medium text-text">{brokerName}</span>
                </div>
              )}
              {totalDeposit > 0 && (
                <div className="text-xs text-text-mid">
                  Celkový vklad: <span className="font-semibold text-emerald">{fmtCZK(totalDeposit)}</span>
                </div>
              )}
              {clientNote && (
                <div className="text-xs text-text-mid">
                  <p className="mb-0.5 font-medium">Poznámky:</p>
                  <p className="text-text whitespace-pre-line bg-surface-hover rounded-[6px] p-2">
                    {clientNote}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Email body */}
          <div>
            <label className="block text-xs font-medium text-text-mid mb-1">
              Text emailu
            </label>
            <textarea
              value={finalBody}
              onChange={(e) => setBodyOverride(e.target.value)}
              rows={8}
              className="w-full px-3 py-2.5 rounded-[10px] border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition resize-none leading-relaxed"
            />
          </div>

          {/* Signature — blue frame */}
          <div className="rounded-[10px] border-2 border-sapphire-border bg-sapphire-pale p-3">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-sapphire">
                Podpis
              </label>
              {editingSignature ? (
                <button
                  onClick={handleSaveSignature}
                  className="text-xs text-sapphire font-medium hover:underline"
                >
                  Uložit
                </button>
              ) : (
                <button
                  onClick={() => setEditingSignature(true)}
                  className="flex items-center gap-1 text-xs text-sapphire/70 hover:text-sapphire"
                >
                  <Pencil size={10} />
                  Upravit
                </button>
              )}
            </div>
            {editingSignature ? (
              <textarea
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-[8px] border border-sapphire-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-sapphire/30 transition resize-none"
              />
            ) : (
              <p className="text-sm text-text whitespace-pre-line">
                {signature || "Žádný podpis"}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] shrink-0">
          <button
            onClick={handleSendMailto}
            disabled={!clientEmail}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-[10px] bg-gradient-to-r from-gold to-gold-light text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            <Send size={16} />
            Otevřít v poštovním klientovi
          </button>
        </div>
      </div>
    </div>
  );
}
