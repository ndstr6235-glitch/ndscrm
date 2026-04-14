"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail, ChevronDown, ChevronUp, Loader2, Clock } from "lucide-react";
import EmailComposer from "@/components/emails/email-composer";
import type { ClientDetail } from "@/app/actions/clients";
import type { EmailTemplateRow, SentEmailRow } from "@/app/actions/emails";
import { getEmailTemplates, getClientSentEmails } from "@/app/actions/emails";
import type { Role } from "@/lib/types";

interface DrawerTabEmailProps {
  client: ClientDetail;
  userRole: Role;
}

function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "právě teď";
  if (minutes < 60) return `před ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `před ${hours} hod`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `před ${days} dny`;

  return new Date(iso).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DrawerTabEmail({
  client,
  userRole,
}: DrawerTabEmailProps) {
  const [templates, setTemplates] = useState<EmailTemplateRow[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [initialTemplateId, setInitialTemplateId] = useState<
    string | undefined
  >(undefined);
  const [loaded, setLoaded] = useState(false);

  // Sent emails history
  const [sentEmails, setSentEmails] = useState<SentEmailRow[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    const emails = await getClientSentEmails(client.id);
    setSentEmails(emails);
    setLoadingHistory(false);
  }, [client.id]);

  useEffect(() => {
    if (!loaded) {
      getEmailTemplates().then((t) => {
        setTemplates(t);
        setLoaded(true);
      });
    }
  }, [loaded]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const totalDeposit = client.totalDeposit;

  function handleOpen(templateId: string) {
    setInitialTemplateId(templateId);
    setComposerOpen(true);
  }

  function handleComposerClose() {
    setComposerOpen(false);
    // Refresh history after sending
    fetchHistory();
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Compose section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Mail size={16} className="text-gold" />
          <span className="text-sm font-semibold text-text">
            Odeslat email klientovi
          </span>
        </div>

        {!client.email && (
          <div className="flex items-center gap-2 p-3 rounded-[10px] bg-amber-pale border border-amber text-amber text-sm mb-2">
            Klient nemá vyplněný email — adresu lze zadat ručně v composeru.
          </div>
        )}

        {!loaded ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleOpen(template.id)}
                className="w-full flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-[10px] border border-border bg-surface hover:bg-surface-hover hover:border-gold/30 transition-colors text-left group"
              >
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
                  <Mail size={14} className="text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text">
                    {template.label}
                  </p>
                  <p className="text-xs text-text-dim truncate">
                    {template.subject}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sent emails history */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-gold" />
          <span className="text-sm font-semibold text-text">
            Odeslané emaily
          </span>
          {sentEmails.length > 0 && (
            <span className="ml-auto text-xs text-text-dim bg-surface-hover rounded-full px-2 py-0.5">
              {sentEmails.length}
            </span>
          )}
        </div>

        {loadingHistory ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 size={18} className="animate-spin text-gold" />
          </div>
        ) : sentEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-xs text-text-dim">
              Zatím nebyly odeslány žádné emaily
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sentEmails.map((email) => {
              const isExpanded = expandedEmailId === email.id;
              return (
                <div
                  key={email.id}
                  className="rounded-[10px] border border-border bg-surface overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedEmailId(isExpanded ? null : email.id)
                    }
                    className="w-full flex items-center gap-3 px-4 py-3 min-h-[44px] text-left hover:bg-surface-hover transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                      <Mail size={14} className="text-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">
                        {email.subject}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {email.templateLabel && (
                          <span className="text-[11px] text-gold/80 bg-gold/10 rounded px-1.5 py-0.5">
                            {email.templateLabel}
                          </span>
                        )}
                        <span className="text-[11px] text-text-dim">
                          {email.senderName}
                        </span>
                        <span className="text-[11px] text-text-faint">
                          {relativeTime(email.createdAt)}
                        </span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-text-dim shrink-0" />
                    ) : (
                      <ChevronDown size={16} className="text-text-dim shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-border">
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-text-dim">
                          <span className="font-medium">Komu:</span>
                          <span>{email.to}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-text-dim">
                          <span className="font-medium">Datum:</span>
                          <span>
                            {new Date(email.createdAt).toLocaleString("cs-CZ", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="mt-3 p-3 rounded-[8px] bg-bg text-sm text-text-mid whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
                          {email.body}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <EmailComposer
        open={composerOpen}
        onClose={handleComposerClose}
        clientName={`${client.firstName} ${client.lastName}`}
        clientEmail={client.email}
        totalDeposit={totalDeposit}
        templates={templates}
        userRole={userRole}
        initialTemplateId={initialTemplateId}
        clientNote={client.note}
        brokerName={client.brokerName}
        clientId={client.id}
      />
    </div>
  );
}
