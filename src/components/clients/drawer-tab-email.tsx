"use client";

import { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import EmailComposer from "@/components/emails/email-composer";
import type { ClientDetail } from "@/app/actions/clients";
import type { EmailTemplateRow } from "@/app/actions/emails";
import { getEmailTemplates } from "@/app/actions/emails";
import type { Role } from "@/lib/types";

interface DrawerTabEmailProps {
  client: ClientDetail;
  userRole: Role;
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

  useEffect(() => {
    if (!loaded) {
      getEmailTemplates().then((t) => {
        setTemplates(t);
        setLoaded(true);
      });
    }
  }, [loaded]);

  const totalDeposit = client.totalDeposit;

  function handleOpen(templateId: string) {
    setInitialTemplateId(templateId);
    setComposerOpen(true);
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Mail size={16} className="text-gold" />
        <span className="text-sm font-semibold text-text">
          Odeslat email klientovi
        </span>
      </div>

      {!client.email ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-text-dim">
            Klient nemá vyplněný email. Přidejte email v záložce Přehled.
          </p>
        </div>
      ) : !loaded ? (
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

      <EmailComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        clientName={`${client.firstName} ${client.lastName}`}
        clientEmail={client.email}
        totalDeposit={totalDeposit}
        templates={templates}
        userRole={userRole}
        initialTemplateId={initialTemplateId}
        clientNote={client.note}
        brokerName={client.brokerName}
      />
    </div>
  );
}
