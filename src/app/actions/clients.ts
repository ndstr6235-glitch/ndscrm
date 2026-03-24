"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ClientDetail {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  callDate: string;
  nextPaymentDate: string;
  paymentFreq: number;
  note: string;
  brokerName: string;
  brokerId: string;
  isInvestor: boolean;
  totalDeposit: number;
  totalProfit: number;
  avgPercent: number;
  payments: {
    id: string;
    amount: number;
    percent: number;
    profit: number;
    date: string;
    note: string;
  }[];
  events: {
    id: string;
    type: string;
    title: string;
    date: string;
    time: string;
    note: string;
  }[];
}

const EVENT_TYPE_MAP: Record<string, string> = {
  CALL: "call",
  PAYMENT: "payment",
  REMINDER: "reminder",
  INTEREST: "interest",
  MEETING: "meeting",
};

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------
export async function getClientDetail(
  clientId: string
): Promise<ClientDetail | null> {
  const session = await getSession();
  if (!session) return null;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      payments: { orderBy: { date: "desc" } },
      events: { orderBy: { date: "desc" } },
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!client) return null;

  if (session.role === "broker" && client.assignedTo !== session.id) {
    return null;
  }

  const totalDeposit = client.payments.reduce((s, p) => s + p.amount, 0);
  const totalProfit = client.payments.reduce((s, p) => s + p.profit, 0);
  const avgPercent =
    client.payments.length > 0
      ? client.payments.reduce((s, p) => s + p.percent, 0) /
        client.payments.length
      : 0;

  return {
    id: client.id,
    firstName: client.firstName,
    lastName: client.lastName,
    phone: client.phone,
    email: client.email,
    callDate: client.callDate,
    nextPaymentDate: client.nextPaymentDate,
    paymentFreq: client.paymentFreq,
    note: client.note,
    brokerName: `${client.user.firstName} ${client.user.lastName}`,
    brokerId: client.user.id,
    isInvestor: client.payments.length > 0,
    totalDeposit,
    totalProfit,
    avgPercent: Math.round(avgPercent * 100) / 100,
    payments: client.payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      percent: p.percent,
      profit: p.profit,
      date: p.date,
      note: p.note,
    })),
    events: client.events.map((e) => ({
      id: e.id,
      type: EVENT_TYPE_MAP[e.type] || "call",
      title: e.title,
      date: e.date,
      time: e.time,
      note: e.note,
    })),
  };
}

// ---------------------------------------------------------------------------
// Create Client
// ---------------------------------------------------------------------------
export async function createClient(data: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  callDate: string;
  nextPaymentDate: string;
  paymentFreq: number;
  note: string;
  assignedTo: string;
}): Promise<{ success: boolean; error?: string; id?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Nepřihlášen" };

  if (!data.firstName.trim() || !data.lastName.trim()) {
    return { success: false, error: "Jméno a příjmení jsou povinné" };
  }

  const assignedTo =
    session.role === "broker" ? session.id : data.assignedTo || session.id;

  const client = await prisma.client.create({
    data: {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      callDate: data.callDate || new Date().toISOString().split("T")[0],
      nextPaymentDate:
        data.nextPaymentDate || new Date().toISOString().split("T")[0],
      paymentFreq: data.paymentFreq || 30,
      note: data.note.trim(),
      assignedTo,
    },
  });

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { success: true, id: client.id };
}

// ---------------------------------------------------------------------------
// Update Client
// ---------------------------------------------------------------------------
export async function updateClient(
  clientId: string,
  data: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    callDate: string;
    nextPaymentDate: string;
    paymentFreq: number;
    note: string;
    assignedTo: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Nepřihlášen" };

  const existing = await prisma.client.findUnique({
    where: { id: clientId },
  });
  if (!existing) return { success: false, error: "Klient nenalezen" };

  if (session.role === "broker" && existing.assignedTo !== session.id) {
    return { success: false, error: "Nemáte oprávnění" };
  }

  if (!data.firstName.trim() || !data.lastName.trim()) {
    return { success: false, error: "Jméno a příjmení jsou povinné" };
  }

  await prisma.client.update({
    where: { id: clientId },
    data: {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      callDate: data.callDate,
      nextPaymentDate: data.nextPaymentDate,
      paymentFreq: data.paymentFreq,
      note: data.note.trim(),
      assignedTo:
        session.role === "broker" ? existing.assignedTo : data.assignedTo,
    },
  });

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Delete Client
// ---------------------------------------------------------------------------
export async function deleteClient(
  clientId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Nepřihlášen" };

  const existing = await prisma.client.findUnique({
    where: { id: clientId },
  });
  if (!existing) return { success: false, error: "Klient nenalezen" };

  if (session.role === "broker" && existing.assignedTo !== session.id) {
    return { success: false, error: "Nemáte oprávnění" };
  }

  await prisma.client.delete({ where: { id: clientId } });

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Create Payment
// ---------------------------------------------------------------------------
export async function createPayment(data: {
  clientId: string;
  amount: number;
  percent: number;
  date: string;
  note: string;
}): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Nepřihlášen" };

  const client = await prisma.client.findUnique({
    where: { id: data.clientId },
  });
  if (!client) return { success: false, error: "Klient nenalezen" };

  if (session.role === "broker" && client.assignedTo !== session.id) {
    return { success: false, error: "Nemáte oprávnění" };
  }

  if (data.amount <= 0) {
    return { success: false, error: "Částka musí být větší než 0" };
  }
  if (data.percent < 0 || data.percent > 100) {
    return { success: false, error: "Procento musí být 0–100" };
  }

  const profit = (data.amount * data.percent) / 100;

  await prisma.payment.create({
    data: {
      clientId: data.clientId,
      amount: data.amount,
      percent: data.percent,
      profit,
      date: data.date || new Date().toISOString().split("T")[0],
      note: data.note.trim(),
    },
  });

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { success: true };
}
