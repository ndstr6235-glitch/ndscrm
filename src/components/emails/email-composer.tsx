"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { X, Send, Mail, Pencil, AlertTriangle, FileText, Sparkles, Loader2, Wand2 } from "lucide-react";
import { generateSalutation, generateEmailDraft, improveEmailText } from "@/app/actions/ai";
import { cn, fmtCZK } from "@/lib/utils";
import { getCurrentUserSignature, updateSignature, sendEmail } from "@/app/actions/emails";
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

// Duration options for contract fields
const DURATION_OPTIONS = [
  { value: "6", label: "6 měsíců" },
  { value: "12", label: "12 měsíců" },
  { value: "24", label: "24 měsíců" },
  { value: "36", label: "36 měsíců" },
];

// Payout frequency options
const FREQUENCY_OPTIONS = [
  { value: "monthly", label: "měsíčně" },
  { value: "quarterly", label: "čtvrtletně" },
];

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
  const [sending, setSending] = useState(false);

  // Editable recipient email address
  const [recipientEmail, setRecipientEmail] = useState(clientEmail);

  // Editable subject line — defaults to template subject with client name inserted
  const [subjectOverride, setSubjectOverride] = useState("");

  // Contract fields for "smlouva" templates
  const [investmentAmount, setInvestmentAmount] = useState<number | "">("");
  const [interestRate, setInterestRate] = useState<number | "">("");
  const [duration, setDuration] = useState("12");
  const [startDate, setStartDate] = useState("");
  const [payoutFrequency, setPayoutFrequency] = useState("monthly");

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
      setRecipientEmail(clientEmail);
      setSubjectOverride("");
      setInvestmentAmount("");
      setInterestRate("");
      setDuration("12");
      setStartDate("");
      setPayoutFrequency("monthly");
    }
  }, [open, initialTemplateId, allowedTemplates, clientEmail]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const selectedTemplate = allowedTemplates.find(
    (t) => t.id === selectedTemplateId
  );

  // Build subject with client name inserted before the last " – " segment
  function buildSubjectWithClient(templateSubject: string): string {
    const parts = templateSubject.split(" – ");
    if (parts.length >= 2) {
      // Insert client name before the last segment
      // e.g. "Investiční smlouva – Build Fund" → "Investiční smlouva – Ondřej Šrutek – Build Fund"
      const last = parts.pop()!;
      return [...parts, clientName, last].join(" – ");
    }
    // Fallback: just append client name
    return `${templateSubject} – ${clientName}`;
  }

  // Reset subject when template changes
  useEffect(() => {
    if (selectedTemplate) {
      setSubjectOverride(buildSubjectWithClient(selectedTemplate.subject));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplateId, selectedTemplate?.subject, clientName]);

  // Detect if selected template is "Smlouva" (admin-only contract)
  const isContractTemplate =
    selectedTemplate?.label.toLowerCase().includes("smlouva") &&
    selectedTemplate?.allowedRoles.length === 1 &&
    selectedTemplate?.allowedRoles[0] === "administrator";

  // Detect if selected template is any "smlouva" type (for showing contract fields)
  const isSmlouvaTemplate =
    selectedTemplate?.label.toLowerCase().includes("smlouva") ?? false;

  // Calculate payout amount based on contract fields
  const calculatedPayout = useMemo(() => {
    if (!investmentAmount || !interestRate) return 0;
    const annual = Number(investmentAmount) * (Number(interestRate) / 100);
    if (payoutFrequency === "quarterly") return Math.round(annual / 4);
    return Math.round(annual / 12);
  }, [investmentAmount, interestRate, payoutFrequency]);

  // Get labels for display
  const durationLabel = DURATION_OPTIONS.find((d) => d.value === duration)?.label || duration;
  const frequencyLabel = FREQUENCY_OPTIONS.find((f) => f.value === payoutFrequency)?.label || payoutFrequency;

  // Build email body with substitutions
  const finalBody = useMemo(() => {
    if (!selectedTemplate) return "";
    const raw = bodyOverride || selectedTemplate.body;

    // Determine the investment amount to use: manual contract field takes priority, fallback to totalDeposit
    const effectiveAmount = investmentAmount ? Number(investmentAmount) : totalDeposit;

    return raw
      .replace(/\[OSLOVENÍ\]/g, salutation || "[OSLOVENÍ]")
      .replace(/\[PODPIS\]/g, signature || "[PODPIS]")
      .replace(/\[VKLAD\]/g, fmtCZK(effectiveAmount))
      .replace(/\[ČÁSTKA\]/g, calculatedPayout > 0 ? fmtCZK(calculatedPayout) : "–")
      .replace(/\[ÚROK\]/g, interestRate ? `${interestRate} %` : "–")
      .replace(/\[DOBA\]/g, durationLabel)
      .replace(/\[FREKVENCE\]/g, frequencyLabel);
  }, [selectedTemplate, bodyOverride, salutation, signature, totalDeposit, investmentAmount, interestRate, calculatedPayout, durationLabel, frequencyLabel]);

  async function handleSaveSignature() {
    const result = await updateSignature(signature);
    setEditingSignature(false);
    if (result.success) {
      toast("Podpis uložen");
    } else {
      toast("Nepodařilo se uložit podpis", "error");
    }
  }

  async function handleSendEmail() {
    if (!selectedTemplate || !recipientEmail) return;
    setSending(true);
    try {
      const contractMeta = isSmlouvaTemplate && investmentAmount
        ? {
            investmentAmount: Number(investmentAmount),
            interestRate: interestRate ? Number(interestRate) : undefined,
            duration,
            startDate: startDate || undefined,
            payoutFrequency,
          }
        : undefined;

      const result = await sendEmail({
        to: recipientEmail,
        subject: subjectOverride || selectedTemplate.subject,
        body: finalBody,
        contractMeta,
      });
      if (result.success) {
        toast("Email byl odeslán");
        onClose();
      } else {
        toast("error" in result ? result.error : "Odeslání selhalo", "error");
      }
    } catch {
      toast("Neočekávaná chyba při odesílání", "error");
    } finally {
      setSending(false);
    }
  }

  function handleSendMailto() {
    if (!selectedTemplate || !recipientEmail) return;
    const subject = subjectOverride || selectedTemplate.subject;
    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(finalBody)}`;
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
          {!clientEmail && !recipientEmail && (
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

          {/* To (editable) + Subject */}
          <div className="bg-surface-hover rounded-[10px] p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <label htmlFor="recipient-email" className="text-text-dim w-16 shrink-0">
                Komu:
              </label>
              <input
                id="recipient-email"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="email@example.com"
                className="flex-1 min-w-0 px-2.5 py-1.5 rounded-[8px] border border-border bg-surface text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
              />
            </div>
            {recipientEmail !== clientEmail && clientEmail && (
              <div className="flex items-center gap-2 ml-[72px]">
                <span className="text-[11px] text-text-faint">
                  Původní: {clientName} &lt;{clientEmail}&gt;
                </span>
                <button
                  type="button"
                  onClick={() => setRecipientEmail(clientEmail)}
                  className="text-[11px] text-gold hover:underline"
                >
                  Obnovit
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <label htmlFor="subject-input" className="text-text-dim w-16 shrink-0">
                Předmět:
              </label>
              <input
                id="subject-input"
                type="text"
                value={subjectOverride}
                onChange={(e) => setSubjectOverride(e.target.value)}
                placeholder="Předmět emailu"
                className="flex-1 min-w-0 px-2.5 py-1.5 rounded-[8px] border border-border bg-surface text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
              />
            </div>
          </div>

          {/* Contract fields — shown for "smlouva" type templates */}
          {isSmlouvaTemplate && (
            <div className="rounded-[10px] border-2 border-gold/30 bg-gold-pale p-3 space-y-3">
              <div className="flex items-center gap-1.5">
                <FileText size={14} className="text-gold" />
                <label className="text-xs font-medium text-gold">
                  Parametry smlouvy
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Investment amount */}
                <div>
                  <label className="block text-xs font-medium text-text-mid mb-1">
                    Výše vkladu
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) =>
                        setInvestmentAmount(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      placeholder="500 000"
                      className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface-hover text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-dim pointer-events-none">
                      CZK
                    </span>
                  </div>
                </div>

                {/* Interest rate */}
                <div>
                  <label className="block text-xs font-medium text-text-mid mb-1">
                    Úroková sazba
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={interestRate}
                      onChange={(e) =>
                        setInterestRate(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      placeholder="8"
                      step="0.1"
                      className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface-hover text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-dim pointer-events-none">
                      %
                    </span>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-medium text-text-mid mb-1">
                    Doba trvání
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface-hover text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition appearance-none"
                  >
                    {DURATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start date */}
                <div>
                  <label className="block text-xs font-medium text-text-mid mb-1">
                    Datum začátku
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface-hover text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
                  />
                </div>

                {/* Payout frequency */}
                <div>
                  <label className="block text-xs font-medium text-text-mid mb-1">
                    Frekvence výplaty
                  </label>
                  <select
                    value={payoutFrequency}
                    onChange={(e) => setPayoutFrequency(e.target.value)}
                    className="w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface-hover text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition appearance-none"
                  >
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Calculated payout display */}
                {calculatedPayout > 0 && (
                  <div className="md:col-span-2 flex items-center gap-2 p-2.5 rounded-[8px] bg-surface border border-gold/20">
                    <span className="text-xs text-text-mid">
                      Vypočtená výplata ({frequencyLabel}):
                    </span>
                    <span className="text-sm font-semibold text-emerald">
                      {fmtCZK(calculatedPayout)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Salutation — golden frame + AI */}
          <div className="rounded-[10px] border-2 border-gold-border bg-gold-pale p-3">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gold">
                Oslovení
              </label>
              <AIButton
                label="Navrhnout"
                icon={<Sparkles size={12} />}
                onClick={async () => {
                  const res = await generateSalutation(clientName);
                  if (res.result) setSalutation(res.result);
                  if (res.error) toast(res.error, "error");
                }}
              />
            </div>
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

          {/* Email body + AI */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-text-mid">
                Text emailu
              </label>
              <div className="flex gap-1.5">
                <AIButton
                  label="Napsat AI"
                  icon={<Wand2 size={12} />}
                  onClick={async () => {
                    const res = await generateEmailDraft({
                      clientName,
                      clientNote,
                      totalDeposit,
                      templateLabel: selectedTemplate?.label,
                      templateBody: selectedTemplate?.body,
                      brokerName,
                    });
                    if (res.result) {
                      if (res.result.salutation) setSalutation(res.result.salutation);
                      setBodyOverride(res.result.body);
                    }
                    if (res.error) toast(res.error, "error");
                  }}
                />
                <AIButton
                  label="Vylepšit"
                  icon={<Sparkles size={12} />}
                  onClick={async () => {
                    const textToImprove = bodyOverride || selectedTemplate?.body || "";
                    if (!textToImprove) return;
                    const res = await improveEmailText(textToImprove);
                    if (res.result) setBodyOverride(res.result);
                    if (res.error) toast(res.error, "error");
                  }}
                />
              </div>
            </div>
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
        <div className="border-t border-border px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] shrink-0 space-y-2">
          <button
            onClick={handleSendEmail}
            disabled={!recipientEmail || !selectedTemplate || sending}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-[10px] bg-gradient-to-r from-gold to-gold-light text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            {sending ? "Odesílání…" : "Odeslat email"}
          </button>
          <button
            onClick={handleSendMailto}
            disabled={!recipientEmail || !selectedTemplate}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-[10px] border border-border text-text-mid text-sm font-medium hover:bg-surface-hover transition-colors disabled:opacity-50"
          >
            <Mail size={16} />
            Otevřít v poštovním klientovi
          </button>
        </div>
      </div>
    </div>
  );
}

// AI action button component
function AIButton({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => Promise<void> }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onClick();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1 px-2 py-1 rounded-[6px] bg-sapphire/10 text-sapphire text-[11px] font-medium hover:bg-sapphire/20 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}
