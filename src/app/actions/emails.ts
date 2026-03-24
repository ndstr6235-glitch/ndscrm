"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

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
