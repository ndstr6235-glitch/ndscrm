"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Resend } from "resend";
import { logAudit } from "./audit";
import { logActivity } from "./activity";

export interface EmailClientRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isInvestor: boolean;
  totalDeposit: number;
  note: string;
  brokerName: string;
}

export interface EmailTemplateRow {
  id: string;
  label: string;
  subject: string;
  body: string;
  allowedRoles: string[];
}

export interface EmailPageData {
  clients: EmailClientRow[];
  templates: EmailTemplateRow[];
  signature: string;
}

export async function getEmailPageData(): Promise<EmailPageData | null> {
  const session = await getSession();
  if (!session) return null;

  const isBroker = session.role === "broker";
  const roleUpper = session.role.toUpperCase();

  const [rawClients, rawTemplates, user] = await Promise.all([
    prisma.client.findMany({
      where: isBroker ? { assignedTo: session.id } : {},
      include: {
        payments: { select: { amount: true } },
        user: { select: { firstName: true, lastName: true } },
      },
      orderBy: { firstName: "asc" },
    }),
    prisma.emailTemplate.findMany({
      orderBy: { label: "asc" },
    }),
    prisma.user.findUnique({
      where: { id: session.id },
      select: { signature: true },
    }),
  ]);

  const clients: EmailClientRow[] = rawClients.map((c) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    isInvestor: c.payments.length > 0,
    totalDeposit: c.payments.reduce((s, p) => s + p.amount, 0),
    note: c.note,
    brokerName: `${c.user.firstName} ${c.user.lastName}`,
  }));

  // Filter templates by role — allowedRoles is comma-separated UPPERCASE in DB
  const templates: EmailTemplateRow[] = rawTemplates
    .filter((t) => t.allowedRoles.split(",").map((r) => r.trim()).includes(roleUpper))
    .map((t) => ({
      id: t.id,
      label: t.label,
      subject: t.subject,
      body: t.body,
      allowedRoles: t.allowedRoles.split(",").map((r) => r.trim().toLowerCase()),
    }));

  return {
    clients,
    templates,
    signature: user?.signature || "",
  };
}

export interface SignatureData {
  signature: string;
  firstName: string;
  lastName: string;
  email: string;
}

export async function getCurrentUserSignature(): Promise<SignatureData> {
  const session = await getSession();
  if (!session) return { signature: "", firstName: "", lastName: "", email: "" };

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { signature: true, firstName: true, lastName: true, email: true },
  });

  return {
    signature: user?.signature || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  };
}

// Aliases used by email-composer.tsx
export const getUserSignature = getCurrentUserSignature;

export async function updateSignature(
  signature: string
): Promise<{ success: boolean }> {
  const session = await getSession();
  if (!session) return { success: false };

  await prisma.user.update({
    where: { id: session.id },
    data: { signature },
  });

  return { success: true };
}

export const updateUserSignature = updateSignature;

// ---------------------------------------------------------------------------
// Individual data fetchers (used by page.tsx and drawer-tab-email.tsx)
// ---------------------------------------------------------------------------
export async function getEmailClients(): Promise<EmailClientRow[]> {
  const session = await getSession();
  if (!session) return [];

  const isBroker = session.role === "broker";

  const rawClients = await prisma.client.findMany({
    where: isBroker ? { assignedTo: session.id } : {},
    include: {
      payments: { select: { amount: true } },
      user: { select: { firstName: true, lastName: true } },
    },
    orderBy: { firstName: "asc" },
  });

  return rawClients.map((c) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    isInvestor: c.payments.length > 0,
    totalDeposit: c.payments.reduce((s, p) => s + p.amount, 0),
    note: c.note,
    brokerName: `${c.user.firstName} ${c.user.lastName}`,
  }));
}

export async function getEmailTemplates(): Promise<EmailTemplateRow[]> {
  const session = await getSession();
  if (!session) return [];

  const roleUpper = session.role.toUpperCase();

  const rawTemplates = await prisma.emailTemplate.findMany({
    orderBy: { label: "asc" },
  });

  return rawTemplates
    .filter((t) => t.allowedRoles.split(",").map((r) => r.trim()).includes(roleUpper))
    .map((t) => ({
      id: t.id,
      label: t.label,
      subject: t.subject,
      body: t.body,
      allowedRoles: t.allowedRoles.split(",").map((r) => r.trim().toLowerCase()),
    }));
}

// ---------------------------------------------------------------------------
// Send email via Resend
// ---------------------------------------------------------------------------

const resend = new Resend(process.env.RESEND_API_KEY);

interface ContractMeta {
  investmentAmount: number;
  interestRate?: number;
  duration?: string;
  startDate?: string;
  payoutFrequency?: string;
}

interface SendEmailInput {
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
  senderName?: string;
  templateLabel?: string;
  contractMeta?: ContractMeta;
  clientId?: string;
  clientName?: string;
}

export async function sendEmail(
  input: SendEmailInput
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Neautorizovaný přístup" };
  }

  const { to, subject, body, replyTo, senderName, templateLabel, contractMeta, clientId, clientName } = input;

  if (!to || !subject || !body) {
    return { success: false, error: "Chybí povinné údaje (email, předmět, text)" };
  }

  try {
    // Build sender name — use the team member name or default to company
    const fromName = senderName || "Nodi Star s.r.o.";
    const from = `${fromName} <noreply@nodistar.cz>`;

    // Always reply to the shared inbox — personal addresses are display-only
    const effectiveReplyTo = "info@nodistar.cz";

    // Build attachments list — each template gets its own attachment
    const attachments: { filename: string; content: Buffer | string; content_type?: string }[] = [];
    const label = templateLabel?.toLowerCase() || "";

    if (label.includes("prezentace")) {
      // Prezentace → attach presentation PDF
      try {
        const { PREZENTACE_PDF_BASE64 } = await import("@/lib/prezentace-pdf");
        if (PREZENTACE_PDF_BASE64) {
          attachments.push({
            filename: "Prezentace-Nodi-Star.pdf",
            content: PREZENTACE_PDF_BASE64,
            content_type: "application/pdf",
          });
        }
      } catch {
        // PDF module not available
      }
    } else if (label.includes("smlouv")) {
      // Návrh smlouvy → completely blank PDF (no client name, no amount, no rate, no duration)
      // Smlouva finální → filled PDF with client data
      try {
        const { generateProposalPdf } = await import("@/lib/proposal-pdf");
        const isNavrh = label.includes("návrh") || label.includes("navrh");
        const pdfBuffer = await generateProposalPdf(
          isNavrh
            ? {}
            : {
                clientName: clientName || undefined,
                clientEmail: to,
                amount: contractMeta?.investmentAmount,
                interestRate: contractMeta?.interestRate,
                duration: contractMeta?.duration,
                payoutFrequency: contractMeta?.payoutFrequency,
              }
        );
        attachments.push({
          filename: "Navrh-smlouvy-Nodi-Star.pdf",
          content: pdfBuffer,
          content_type: "application/pdf",
        });
      } catch (err) {
        console.error("Proposal PDF generation failed:", err);
      }
    }

    const { error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      text: body,
      replyTo: [effectiveReplyTo],
      ...(attachments.length > 0 ? { attachments } : {}),
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message || "Odeslání selhalo" };
    }

    // Build audit detail string including contract metadata if present
    let auditDetail = `To: ${to}, Subject: ${subject}`;
    if (contractMeta) {
      const parts: string[] = [];
      parts.push(`Vklad: ${contractMeta.investmentAmount} CZK`);
      if (contractMeta.interestRate != null) parts.push(`Úrok: ${contractMeta.interestRate}%`);
      if (contractMeta.duration) parts.push(`Doba: ${contractMeta.duration} měs.`);
      if (contractMeta.startDate) parts.push(`Začátek: ${contractMeta.startDate}`);
      if (contractMeta.payoutFrequency) parts.push(`Frekvence: ${contractMeta.payoutFrequency}`);
      auditDetail += ` | Smlouva: ${parts.join(", ")}`;
    }

    // Audit log
    await logAudit(
      session.id,
      "SEND_EMAIL",
      "email",
      undefined,
      auditDetail
    );

    // Save sent email record + activity log if clientId is provided
    if (clientId) {
      await Promise.all([
        prisma.sentEmail.create({
          data: {
            clientId,
            userId: session.id,
            to,
            subject,
            body,
            templateLabel: templateLabel || null,
          },
        }),
        logActivity(
          clientId,
          session.id,
          "EMAIL_SENT",
          `Odeslán email: ${subject}`
        ),
      ]);
    }

    return { success: true };
  } catch (err) {
    console.error("Email send failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Neočekávaná chyba při odesílání",
    };
  }
}

// ---------------------------------------------------------------------------
// Sent email history for a client
// ---------------------------------------------------------------------------

export interface SentEmailRow {
  id: string;
  to: string;
  subject: string;
  body: string;
  templateLabel: string | null;
  senderName: string;
  createdAt: string;
}

export async function getClientSentEmails(
  clientId: string
): Promise<SentEmailRow[]> {
  const session = await getSession();
  if (!session) return [];

  // RBAC: brokers can only see emails for their own clients
  if (session.role === "broker") {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { assignedTo: true },
    });
    if (!client || client.assignedTo !== session.id) return [];
  }

  const emails = await prisma.sentEmail.findMany({
    where: { clientId },
    include: {
      user: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return emails.map((e) => ({
    id: e.id,
    to: e.to,
    subject: e.subject,
    body: e.body,
    templateLabel: e.templateLabel,
    senderName: `${e.user.firstName} ${e.user.lastName}`,
    createdAt: e.createdAt.toISOString(),
  }));
}
