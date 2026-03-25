"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Resend } from "resend";
import { logAudit } from "./audit";

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

export async function getCurrentUserSignature(): Promise<string> {
  const session = await getSession();
  if (!session) return "";

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { signature: true },
  });

  return user?.signature || "";
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
  contractMeta?: ContractMeta;
}

export async function sendEmail(
  input: SendEmailInput
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Neautorizovaný přístup" };
  }

  const { to, subject, body, replyTo, contractMeta } = input;

  if (!to || !subject || !body) {
    return { success: false, error: "Chybí povinné údaje (email, předmět, text)" };
  }

  try {
    const { error } = await resend.emails.send({
      from: "Build Fund CRM <noreply@nodistar.cz>",
      to: [to],
      subject,
      text: body,
      ...(replyTo ? { replyTo: [replyTo] } : {}),
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

    return { success: true };
  } catch (err) {
    console.error("Email send failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Neočekávaná chyba při odesílání",
    };
  }
}
