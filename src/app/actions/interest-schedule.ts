"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logActivity } from "./activity";
import { logAudit } from "./audit";

interface ScheduleInterestPaymentsInput {
  clientId: string;
  clientName: string;
  amount: number;
  interestRate: number; // % p.a.
  durationMonths: number;
  startDate?: string;
  payoutFrequency: "monthly" | "quarterly";
  bankAccount?: string; // client's bank account (where we send the payouts)
}

/**
 * After "Smlouva finální" is sent, creates:
 * 1. A Payment record representing the deposit
 * 2. A CalEvent INTEREST event for each scheduled payout
 * 3. Updates client's nextPaymentDate
 *
 * Uses only EXISTING Prisma schema fields — no migration required.
 */
export async function scheduleInterestPayments(
  input: ScheduleInterestPaymentsInput
): Promise<{ success: true; eventsCreated: number } | { success: false; error: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Neautorizovaný přístup" };

  const {
    clientId,
    clientName,
    amount,
    interestRate,
    durationMonths,
    startDate,
    payoutFrequency,
    bankAccount,
  } = input;

  if (!amount || !interestRate || !durationMonths) {
    return { success: false, error: "Chybí parametry smlouvy" };
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { assignedTo: true },
  });
  if (!client) return { success: false, error: "Klient nenalezen" };

  // Compute per-period payout: annual interest / periods per year
  const annual = amount * (interestRate / 100);
  const perPeriod =
    payoutFrequency === "quarterly" ? Math.round(annual / 4) : Math.round(annual / 12);
  const periodStepMonths = payoutFrequency === "quarterly" ? 3 : 1;
  const numPayouts = Math.floor(durationMonths / periodStepMonths);

  // Start date defaults to today; payouts land on 15th of each period
  const start = startDate ? new Date(startDate) : new Date();

  try {
    // 1. Create Payment record for the deposit itself
    await prisma.payment.create({
      data: {
        clientId,
        amount,
        percent: interestRate,
        profit: annual * (durationMonths / 12),
        date: start.toISOString().split("T")[0],
        duration: durationMonths,
        monthlyPayout: perPeriod,
        payoutFrequency,
        note: `Smlouva ${durationMonths} měs., výplata ${payoutFrequency === "quarterly" ? "čtvrtletně" : "měsíčně"}${bankAccount ? `, účet klienta: ${bankAccount}` : ""}`,
      },
    });

    // 2. Create a CalEvent INTEREST for each scheduled payout
    const eventsData: {
      clientId: string;
      userId: string;
      type: "INTEREST";
      title: string;
      date: string;
      time: string;
      note: string;
    }[] = [];

    const bankLine = bankAccount
      ? `\nČíslo účtu klienta: ${bankAccount}`
      : "\nČíslo účtu klienta: (nezadáno)";

    for (let i = 0; i < numPayouts; i++) {
      const payoutDate = new Date(start);
      payoutDate.setMonth(payoutDate.getMonth() + (i + 1) * periodStepMonths);
      payoutDate.setDate(15);
      const dateStr = payoutDate.toISOString().split("T")[0];

      eventsData.push({
        clientId,
        userId: client.assignedTo,
        type: "INTEREST",
        title: `Výplata úroku — ${clientName} — ${perPeriod.toLocaleString("cs-CZ")} Kč`,
        date: dateStr,
        time: "09:00",
        note: `Splátka ${i + 1}/${numPayouts} • vklad ${amount.toLocaleString("cs-CZ")} Kč • ${interestRate}% p.a.${bankLine}`,
      });
    }

    if (eventsData.length > 0) {
      await prisma.calEvent.createMany({ data: eventsData });

      // 3. Update client's nextPaymentDate to the first upcoming payout
      await prisma.client.update({
        where: { id: clientId },
        data: {
          nextPaymentDate: eventsData[0].date,
          paymentFreq: periodStepMonths * 30,
        },
      });
    }

    // 4. Activity log
    await logActivity(
      clientId,
      session.id,
      "PAYMENT_ADDED",
      `Naplánováno ${eventsData.length} výplat úroku (${perPeriod.toLocaleString("cs-CZ")} Kč ${payoutFrequency === "quarterly" ? "čtvrtletně" : "měsíčně"})`
    );

    // 5. Audit log
    await logAudit(
      session.id,
      "SCHEDULE_INTEREST_PAYMENTS",
      "payment",
      undefined,
      `Klient: ${clientName}, Vklad: ${amount} Kč, Úrok: ${interestRate}% p.a., Doba: ${durationMonths} měs., Počet výplat: ${eventsData.length}`
    );

    return { success: true, eventsCreated: eventsData.length };
  } catch (err) {
    console.error("scheduleInterestPayments failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Neočekávaná chyba při plánování výplat",
    };
  }
}
