"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { FileText, Download, Mail, Loader2, Eye, Send } from "lucide-react";
import { generateContractHTML } from "@/lib/contract-template";
import { sendContractEmail } from "@/app/actions/contracts";
import { useToast } from "@/components/ui/toast";
import type { Role } from "@/lib/types";
import type { ContractData } from "@/lib/contract-template";

interface ContractGeneratorProps {
  userRole: Role;
}

const DURATION_OPTIONS = [
  { value: 6, label: "6 měsíců" },
  { value: 12, label: "12 měsíců" },
  { value: 24, label: "24 měsíců" },
  { value: 36, label: "36 měsíců" },
];

const FREQUENCY_OPTIONS = [
  { value: "monthly", label: "měsíčně" },
  { value: "quarterly", label: "čtvrtletně" },
];

const INPUT_CLASS =
  "w-full px-3 py-2.5 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition";

const LABEL_CLASS = "block text-xs font-medium text-text-mid mb-1";

export default function ContractGenerator({ userRole }: ContractGeneratorProps) {
  const { toast } = useToast();
  const previewRef = useRef<HTMLIFrameElement>(null);

  // Form state
  const [clientName, setClientName] = useState("");
  const [clientBirthdate, setClientBirthdate] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientBank, setClientBank] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [amountWords, setAmountWords] = useState("");
  const [interestRate, setInterestRate] = useState<number>(2);
  const [duration, setDuration] = useState<number>(12);
  const [payoutFrequency, setPayoutFrequency] = useState("monthly");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [sending, setSending] = useState(false);

  // Build contract data object
  const contractData: ContractData = useMemo(
    () => ({
      clientName,
      clientBirthdate,
      clientAddress,
      clientBank,
      amount,
      amountWords,
      interestRate,
      duration,
      payoutFrequency,
      startDate,
    }),
    [
      clientName,
      clientBirthdate,
      clientAddress,
      clientBank,
      amount,
      amountWords,
      interestRate,
      duration,
      payoutFrequency,
      startDate,
    ]
  );

  // Generate live preview HTML (client-side, no server roundtrip)
  const previewHtml = useMemo(() => {
    return generateContractHTML(contractData);
  }, [contractData]);

  // Write HTML into iframe on load
  const iframeOnLoad = useCallback(() => {
    if (previewRef.current) {
      const doc = previewRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(previewHtml);
        doc.close();
      }
    }
  }, [previewHtml]);

  // Ref callback: write content on mount and on every previewHtml change
  const updateIframe = useCallback(
    (iframe: HTMLIFrameElement | null) => {
      if (iframe) {
        (previewRef as React.MutableRefObject<HTMLIFrameElement>).current =
          iframe;
        const doc = iframe.contentDocument;
        if (doc) {
          doc.open();
          doc.write(previewHtml);
          doc.close();
        }
      }
    },
    [previewHtml]
  );

  // Print / Download PDF via browser print dialog
  function handlePrint() {
    if (previewRef.current) {
      const iframeWin = previewRef.current.contentWindow;
      if (iframeWin) {
        iframeWin.focus();
        iframeWin.print();
      }
    }
  }

  // Send contract email via server action
  async function handleSendEmail() {
    if (!emailTo.trim()) {
      toast("Zadejte emailovou adresu", "error");
      return;
    }

    setSending(true);
    const result = await sendContractEmail(emailTo, previewHtml, clientName);
    setSending(false);

    if (result.success) {
      toast("Smlouva odeslána emailem");
      setShowEmailModal(false);
      setEmailTo("");
    } else {
      toast(result.error || "Odeslání se nezdařilo", "error");
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
          <FileText size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-text">
            Generátor smluv
          </h1>
          <p className="text-sm text-text-dim">
            Vyplňte údaje a vygenerujte smlouvu o zápůjčce
          </p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 sm:gap-6">
        {/* LEFT: Form */}
        <div className="w-full xl:w-[420px] shrink-0">
          <div className="bg-surface rounded-[16px] border border-border shadow-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text flex items-center gap-2">
              <Eye size={16} className="text-gold" />
              Údaje věřitele a smlouvy
            </h2>

            {/* Client name */}
            <div>
              <label className={LABEL_CLASS}>
                Jméno a příjmení věřitele *
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Jan Novák"
                className={INPUT_CLASS}
              />
            </div>

            {/* Birthdate */}
            <div>
              <label className={LABEL_CLASS}>RČ / datum narození</label>
              <input
                type="text"
                value={clientBirthdate}
                onChange={(e) => setClientBirthdate(e.target.value)}
                placeholder="850101/1234"
                className={INPUT_CLASS}
              />
            </div>

            {/* Address */}
            <div>
              <label className={LABEL_CLASS}>Bytem</label>
              <input
                type="text"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Hlavní 123, 110 00 Praha 1"
                className={INPUT_CLASS}
              />
            </div>

            {/* Bank */}
            <div>
              <label className={LABEL_CLASS}>Bankovní spojení</label>
              <input
                type="text"
                value={clientBank}
                onChange={(e) => setClientBank(e.target.value)}
                placeholder="1234567890/0100"
                className={INPUT_CLASS}
              />
            </div>

            {/* Amount row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLASS}>Výše zápůjčky (Kč) *</label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={amount || ""}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  placeholder="500000"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Výše slovy</label>
                <input
                  type="text"
                  value={amountWords}
                  onChange={(e) => setAmountWords(e.target.value)}
                  placeholder="pět set tisíc"
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            {/* Interest rate */}
            <div>
              <label className={LABEL_CLASS}>Úroková sazba (% měsíčně)</label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={interestRate}
                onChange={(e) =>
                  setInterestRate(parseFloat(e.target.value) || 0)
                }
                className={INPUT_CLASS}
              />
            </div>

            {/* Duration */}
            <div>
              <label className={LABEL_CLASS}>Doba trvání</label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className={INPUT_CLASS}
              >
                {DURATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Payout frequency */}
            <div>
              <label className={LABEL_CLASS}>Frekvence výplaty</label>
              <select
                value={payoutFrequency}
                onChange={(e) => setPayoutFrequency(e.target.value)}
                className={INPUT_CLASS}
              >
                {FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Start date */}
            <div>
              <label className={LABEL_CLASS}>Datum začátku</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-[10px] bg-gradient-to-r from-gold to-gold-light text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
              >
                <Download size={16} />
                Stáhnout PDF
              </button>
              <button
                type="button"
                onClick={() => setShowEmailModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm font-semibold text-text hover:bg-surface-hover transition"
              >
                <Mail size={16} />
                Odeslat emailem
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Live Preview */}
        <div className="flex-1 min-w-0">
          <div className="bg-surface rounded-[16px] border border-border shadow-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center gap-2">
              <Eye size={16} className="text-gold" />
              <span className="text-sm font-semibold text-text">
                Náhled smlouvy
              </span>
            </div>
            <div className="bg-[#f0f2f7] dark:bg-[#0a0c12] p-4">
              <iframe
                ref={updateIframe}
                onLoad={iframeOnLoad}
                title="Contract preview"
                className="w-full h-[300px] sm:h-[400px] md:h-[600px] lg:h-[800px] bg-white rounded-[8px] shadow-md"
                style={{ border: "none" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Email send modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowEmailModal(false)}
          />
          <div className="relative bg-surface rounded-[16px] border border-border shadow-lg w-full max-w-md mx-4 p-6 space-y-4 animate-fade-in">
            <h3 className="text-lg font-display font-bold text-text flex items-center gap-2">
              <Send size={18} className="text-gold" />
              Odeslat smlouvu emailem
            </h3>
            <div>
              <label className={LABEL_CLASS}>
                Emailová adresa příjemce *
              </label>
              <input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="klient@email.cz"
                className={INPUT_CLASS}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendEmail();
                }}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="flex-1 px-4 py-3 min-h-[44px] rounded-[10px] border border-border bg-surface text-sm font-semibold text-text hover:bg-surface-hover transition"
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={sending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-[10px] bg-gradient-to-r from-gold to-gold-light text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow disabled:opacity-60"
              >
                {sending && <Loader2 size={16} className="animate-spin" />}
                Odeslat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
