"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export interface DayTask {
  id: string;
  type: "call" | "payment" | "reminder" | "meeting";
  title: string;
  time: string;
  clientId: string | null;
  clientName: string | null;
  clientPhone: string | null;
  done: boolean;
}

export interface FollowUp {
  id: string;
  name: string;
  phone: string;
  nextPaymentDate: string;
  daysOverdue: number;
}

export interface MyDayData {
  tasks: DayTask[];
  followUps: FollowUp[];
  brokerName?: string;
}

const TYPE_MAP: Record<string, DayTask["type"]> = {
  CALL: "call",
  PAYMENT: "payment",
  REMINDER: "reminder",
  MEETING: "meeting",
};

export async function getMyDayData(): Promise<MyDayData> {
  const session = await getSession();
  if (!session) return { tasks: [], followUps: [] };

  const isBroker = session.role === "broker";
  const today = new Date().toISOString().split("T")[0];

  // Today's events
  const events = await prisma.calEvent.findMany({
    where: {
      date: today,
      ...(isBroker ? { userId: session.id } : {}),
    },
    include: {
      client: { select: { firstName: true, lastName: true, phone: true } },
    },
    orderBy: [{ time: "asc" }],
  });

  const tasks: DayTask[] = events.map((e) => ({
    id: e.id,
    type: TYPE_MAP[e.type] || "call",
    title: e.title,
    time: e.time,
    clientId: e.clientId,
    clientName: e.client ? `${e.client.firstName} ${e.client.lastName}` : null,
    clientPhone: e.client?.phone ?? null,
    done: false,
  }));

  // Follow-ups: clients with nextPaymentDate = today or up to 3 days overdue
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const threeDaysAgoStr = threeDaysAgo.toISOString().split("T")[0];

  const overdueClients = await prisma.client.findMany({
    where: {
      nextPaymentDate: { gte: threeDaysAgoStr, lte: today },
      ...(isBroker ? { assignedTo: session.id } : {}),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      nextPaymentDate: true,
    },
    orderBy: { nextPaymentDate: "asc" },
  });

  const followUps: FollowUp[] = overdueClients.map((c) => {
    const diffMs = new Date(today).getTime() - new Date(c.nextPaymentDate).getTime();
    const daysOverdue = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    return {
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      phone: c.phone,
      nextPaymentDate: c.nextPaymentDate,
      daysOverdue,
    };
  });

  return { tasks, followUps };
}

export async function markTaskDone(eventId: string, note?: string): Promise<void> {
  const session = await getSession();
  if (!session) return;

  // Add a note to the event if provided
  if (note) {
    await prisma.calEvent.update({
      where: { id: eventId },
      data: { note },
    });
  }

  // Log activity if event has a client
  const event = await prisma.calEvent.findUnique({
    where: { id: eventId },
    select: { clientId: true, title: true, type: true },
  });

  if (event?.clientId) {
    const { logActivity } = await import("./activity");
    await logActivity(
      event.clientId,
      session.id,
      "EVENT_CREATED",
      `Splněno: ${event.title}`,
    );
  }
}
