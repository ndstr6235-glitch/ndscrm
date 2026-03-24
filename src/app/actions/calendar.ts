"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const EVENT_TYPE_MAP: Record<string, string> = {
  CALL: "call",
  PAYMENT: "payment",
  REMINDER: "reminder",
  INTEREST: "interest",
  MEETING: "meeting",
};

const EVENT_TYPE_REVERSE: Record<string, string> = {
  call: "CALL",
  payment: "PAYMENT",
  reminder: "REMINDER",
  interest: "INTEREST",
  meeting: "MEETING",
};

export interface CalendarEvent {
  id: string;
  type: string;
  title: string;
  date: string;
  time: string;
  note: string;
  clientName: string | null;
  clientId: string | null;
}

export async function getMonthEvents(
  year: number,
  month: number
): Promise<CalendarEvent[]> {
  const session = await getSession();
  if (!session) return [];

  const isBroker = session.role === "broker";
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

  const events = await prisma.calEvent.findMany({
    where: {
      ...(isBroker ? { userId: session.id } : {}),
      date: { gte: startDate, lt: endDate },
    },
    include: {
      client: { select: { firstName: true, lastName: true } },
    },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

  return events.map((e) => ({
    id: e.id,
    type: EVENT_TYPE_MAP[e.type] || "call",
    title: e.title,
    date: e.date,
    time: e.time,
    note: e.note,
    clientName: e.client
      ? `${e.client.firstName} ${e.client.lastName}`
      : null,
    clientId: e.clientId,
  }));
}

export async function createEvent(data: {
  type: string;
  title: string;
  date: string;
  time: string;
  clientId?: string;
  note: string;
}): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Nepřihlášen" };

  if (!data.title.trim()) {
    return { success: false, error: "Název je povinný" };
  }

  const prismaType = EVENT_TYPE_REVERSE[data.type];
  if (!prismaType) {
    return { success: false, error: "Neplatný typ události" };
  }

  await prisma.calEvent.create({
    data: {
      type: prismaType as "CALL" | "PAYMENT" | "REMINDER" | "INTEREST" | "MEETING",
      title: data.title.trim(),
      date: data.date || new Date().toISOString().split("T")[0],
      time: data.time || "09:00",
      note: data.note.trim(),
      userId: session.id,
      clientId: data.clientId || null,
    },
  });

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteEvent(
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: "Nepřihlášen" };

  const event = await prisma.calEvent.findUnique({
    where: { id: eventId },
  });
  if (!event) return { success: false, error: "Událost nenalezena" };

  if (session.role === "broker" && event.userId !== session.id) {
    return { success: false, error: "Nemáte oprávnění" };
  }

  await prisma.calEvent.delete({ where: { id: eventId } });

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { success: true };
}
