"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export interface MonthlyChartData {
  month: string;
  label: string;
  amount: number;
  profit: number;
}

const CZ_MONTHS = [
  "Leden", "Únor", "Březen", "Duben", "Květen", "Červen",
  "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec",
];

export async function getChartData(): Promise<MonthlyChartData[]> {
  const session = await getSession();
  if (!session) return [];

  const isBroker = session.role === "broker";

  const payments = await prisma.payment.findMany({
    where: isBroker ? { client: { assignedTo: session.id } } : undefined,
    select: { date: true, amount: true, profit: true },
  });

  // Build last 6 months keys
  const now = new Date();
  const months: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${CZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    months.push({ key, label });
  }

  // Aggregate payments by month
  const byMonth: Record<string, { amount: number; profit: number }> = {};
  for (const m of months) {
    byMonth[m.key] = { amount: 0, profit: 0 };
  }

  for (const p of payments) {
    // date format: "YYYY-MM-DD"
    const monthKey = p.date.substring(0, 7);
    if (byMonth[monthKey]) {
      byMonth[monthKey].amount += p.amount;
      byMonth[monthKey].profit += p.profit;
    }
  }

  return months.map((m) => ({
    month: m.key,
    label: m.label,
    amount: byMonth[m.key].amount,
    profit: byMonth[m.key].profit,
  }));
}
