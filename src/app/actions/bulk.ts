"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdminOrSupervisor() {
  const session = await getSession();
  if (!session || session.role === "broker") return null;
  return session;
}

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "administrator") return null;
  return session;
}

export async function bulkAssignBroker(clientIds: string[], brokerId: string) {
  const session = await requireAdminOrSupervisor();
  if (!session) return { error: "Nemáte oprávnění." };
  if (!clientIds.length || !brokerId) return { error: "Vyberte klienty a brokera." };

  await prisma.client.updateMany({
    where: { id: { in: clientIds } },
    data: { assignedTo: brokerId },
  });

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { success: true, count: clientIds.length };
}

export async function bulkChangeStage(clientIds: string[], stage: string) {
  const session = await requireAdminOrSupervisor();
  if (!session) return { error: "Nemáte oprávnění." };
  if (!clientIds.length || !stage) return { error: "Vyberte klienty a stage." };

  await prisma.client.updateMany({
    where: { id: { in: clientIds } },
    data: { stage },
  });

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { success: true, count: clientIds.length };
}

export async function bulkDelete(clientIds: string[]) {
  const session = await requireAdmin();
  if (!session) return { error: "Pouze administrátor může mazat." };
  if (!clientIds.length) return { error: "Vyberte klienty." };

  await prisma.client.deleteMany({
    where: { id: { in: clientIds } },
  });

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { success: true, count: clientIds.length };
}

export async function bulkExportCSV(clientIds: string[]) {
  const session = await requireAdminOrSupervisor();
  if (!session) return { error: "Nemáte oprávnění." };
  if (!clientIds.length) return { error: "Vyberte klienty." };

  const clients = await prisma.client.findMany({
    where: { id: { in: clientIds } },
    include: {
      payments: { select: { amount: true, profit: true } },
      user: { select: { firstName: true, lastName: true } },
    },
  });

  const header = "Jméno,Příjmení,Email,Telefon,Vklad,Výdělek,Broker,Stage\n";
  const rows = clients.map((c) => {
    const totalDeposit = c.payments.reduce((s, p) => s + p.amount, 0);
    const totalProfit = c.payments.reduce((s, p) => s + p.profit, 0);
    const broker = c.user ? `${c.user.firstName} ${c.user.lastName}` : "";
    return `"${c.firstName}","${c.lastName}","${c.email}","${c.phone}",${totalDeposit},${totalProfit},"${broker}","${c.stage}"`;
  }).join("\n");

  return { success: true, csv: header + rows };
}
