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
  durationMonths: number; // 6 / 12 / 24 / 36
  startDate?: string; // YYYY-MM-DD; defaults to today
  payoutFrequency: "monthly" | "quarterly";
}

/**
 * Creates a Payment record + series of CalEvent INTEREST events for the
 * entire contract duration. Called after "Smlouva finální" is sent.
 */
export async function scheduleInterestPayments(
  input: ScheduleInterestPaymentsInput
): Promise<{ success: true; eventsCreated: number } | { success: false; error: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Neautorizovaný přístup" };

  const { clientId, clientName, amount, interestRate, durationMonths, startDate, payoutFrequency } =
    input;

  if (!amount || !interestRate || !durationMonths) {
    return { success: false, error: "Chybí parametry smlouvy" };
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { assignedTo: true, bankAccount: true },
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
        note: `Smlouva na ${durationMonths} měsíců, výplata ${payoutFrequency === "quarterly" ? "čtvrtletně" : "měsíčně"}`,
      },
    });

    // 2. Create a CalEvent INTEREST for each scheduled payout
    // Payouts land on the 15th of the period following the start
    const eventsData: {
      clientId: string;
      userId: string;
      type: "INTEREST";
      title: string;
      date: string;
      time: string;
      note: string;
    }[] = [];

    for (let i = 0; i < numPayouts; i++) {
      const payoutDate = new Date(start);
      // Move i+1 periods forward, set to 15th of that month
      payoutDate.setMonth(payoutDate.getMonth() + (i + 1) * periodStepMonths);
      payoutDate.setDate(15);
      const dateStr = payoutDate.toISOString().split("T")[0];

      const bankLine = client.bankAccount
        ? `\nČíslo účtu klienta: ${client.bankAccount}`
        : "\nČíslo účtu klienta není v CRM — doplň v detailu klienta";

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
    }

    // 3. Update client's nextPaymentDate to the first upcoming payout
    if (eventsData.length > 0) {
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
      "CONTRACT_SCHEDULED",
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
