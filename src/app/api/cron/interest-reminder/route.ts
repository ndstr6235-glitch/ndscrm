import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Resend } from "resend";

/**
 * Cron job — runs on the 14th of every month at 08:00 (configured in vercel.json).
 *
 * Aggregates all clients with INTEREST CalEvents scheduled for the current
 * month (within the next 30 days) and:
 * 1. Creates an in-app Notification for every administrator/supervisor
 * 2. Sends a summary email to info@nodistar.cz listing all upcoming payouts
 *    (kdo, kolik, na jaký účet)
 */
export async function GET(req: NextRequest) {
  // Vercel Cron sends an Authorization header — verify it
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const start = now.toISOString().split("T")[0];
  const end = new Date(now);
  end.setDate(end.getDate() + 30);
  const endStr = end.toISOString().split("T")[0];

  // Get all upcoming INTEREST events in next 30 days
  const events = await prisma.calEvent.findMany({
    where: {
      type: "INTEREST",
      date: { gte: start, lte: endStr },
    },
    include: {
      client: {
        select: {
          firstName: true,
          lastName: true,
          payments: {
            select: {
              note: true,
              amount: true,
              percent: true,
              monthlyPayout: true,
              payoutFrequency: true,
            },
            orderBy: { date: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { date: "asc" },
  });

  if (events.length === 0) {
    return NextResponse.json({ ok: true, message: "Žádné nadcházející úroky", count: 0 });
  }

  const fmtCZK = (n: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 }).format(n);

  // Build summary lines: dátum — jméno — částka k výplatě (vklad × %) — účet
  const lines: string[] = [];
  let totalToPay = 0;
  for (const e of events) {
    const clientName = e.client
      ? `${e.client.firstName} ${e.client.lastName}`
      : "(neznámý)";
    const payment = e.client?.payments[0];
    const note = payment?.note || "";
    const bankMatch = note.match(/\[Účet:\s*([^\]]+)\]/);
    const bank = bankMatch ? bankMatch[1].trim() : "(účet nezadán)";

    const payoutAmount = payment?.monthlyPayout || 0;
    const principal = payment?.amount || 0;
    const percent = payment?.percent || 0;
    totalToPay += payoutAmount;

    const breakdown = principal && percent
      ? ` (vklad ${fmtCZK(principal)} × ${percent}% p.a.)`
      : "";

    lines.push(
      `• ${e.date} — ${clientName} — ${fmtCZK(payoutAmount)}${breakdown} — účet: ${bank}`
    );
  }

  lines.push("");
  lines.push(`CELKEM K VÝPLATĚ: ${fmtCZK(totalToPay)} (${events.length} výplat)`);

  const summary = lines.join("\n");
  const subject = `Připomínka výplaty úroků — ${events.length} klient(ů) tento měsíc`;
  const emailBody = `Připomínka pro výplatu úroků v následujících 30 dnech:\n\n${summary}\n\n---\nNodis Star CRM`;

  // Send summary email to info@
  try {
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Nodis Star CRM <noreply@nodistar.cz>",
        to: ["info@nodistar.cz"],
        subject,
        text: emailBody,
      });
    }
  } catch (err) {
    console.error("Cron email failed:", err);
  }

  // Create in-app notification for every admin + supervisor
  try {
    const recipients = await prisma.user.findMany({
      where: {
        active: true,
        role: { in: ["ADMINISTRATOR", "SUPERVISOR"] },
      },
      select: { id: true },
    });

    if (recipients.length > 0) {
      await prisma.notification.createMany({
        data: recipients.map((u) => ({
          userId: u.id,
          type: "INTEREST_REMINDER",
          title: subject,
          message: summary,
          link: "/calendar",
        })),
      });
    }
  } catch (err) {
    console.error("Cron notifications failed:", err);
  }

  return NextResponse.json({ ok: true, count: events.length });
}
