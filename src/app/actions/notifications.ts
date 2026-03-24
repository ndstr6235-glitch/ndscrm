"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export interface NotificationRow {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

export async function getNotifications(): Promise<NotificationRow[]> {
  const session = await getSession();
  if (!session) return [];

  // Generate auto-notifications before fetching
  await generateAutoNotifications(session.id);

  const notifications = await prisma.notification.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    read: n.read,
    link: n.link,
    createdAt: n.createdAt.toISOString(),
  }));
}

export async function getUnreadCount(): Promise<number> {
  const session = await getSession();
  if (!session) return 0;

  return prisma.notification.count({
    where: { userId: session.id, read: false },
  });
}

export async function markAsRead(notificationId: string): Promise<void> {
  const session = await getSession();
  if (!session) return;

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: session.id },
    data: { read: true },
  });
}

export async function markAllAsRead(): Promise<void> {
  const session = await getSession();
  if (!session) return;

  await prisma.notification.updateMany({
    where: { userId: session.id, read: false },
    data: { read: true },
  });
}

async function generateAutoNotifications(userId: string) {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  // Check if we already generated today (prevent duplicates)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const existingToday = await prisma.notification.count({
    where: {
      userId,
      type: { in: ["payment_due", "call_today"] },
      createdAt: { gte: todayStart },
    },
  });

  if (existingToday > 0) return;

  // Find clients with payments due today or tomorrow
  const dueSoonClients = await prisma.client.findMany({
    where: {
      assignedTo: userId,
      nextPaymentDate: { in: [today, tomorrow] },
    },
    select: { id: true, firstName: true, lastName: true, nextPaymentDate: true },
  });

  for (const client of dueSoonClients) {
    const isToday = client.nextPaymentDate === today;
    await prisma.notification.create({
      data: {
        userId,
        type: "payment_due",
        title: isToday ? "Platba dnes splatna" : "Platba zitra splatna",
        message: `${client.firstName} ${client.lastName} — splatnost ${isToday ? "dnes" : "zitra"}`,
        link: `/clients?open=${client.id}`,
      },
    });
  }

  // Find calls scheduled for today
  const todayCalls = await prisma.calEvent.findMany({
    where: {
      userId,
      date: today,
      type: "CALL",
    },
    include: {
      client: { select: { firstName: true, lastName: true } },
    },
  });

  for (const event of todayCalls) {
    const clientName = event.client
      ? `${event.client.firstName} ${event.client.lastName}`
      : event.title;
    await prisma.notification.create({
      data: {
        userId,
        type: "call_today",
        title: "Hovor naplanovany na dnes",
        message: `${clientName} v ${event.time}`,
        link: `/calendar`,
      },
    });
  }

  // Find reminders for today
  const todayReminders = await prisma.calEvent.findMany({
    where: {
      userId,
      date: today,
      type: "REMINDER",
    },
    include: {
      client: { select: { firstName: true, lastName: true } },
    },
  });

  for (const event of todayReminders) {
    const clientName = event.client
      ? `${event.client.firstName} ${event.client.lastName}`
      : event.title;
    await prisma.notification.create({
      data: {
        userId,
        type: "reminder",
        title: "Pripominka",
        message: `${clientName} — ${event.title}`,
        link: `/calendar`,
      },
    });
  }
}

// Generic helper to create a notification
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string
): Promise<void> {
  await prisma.notification.create({
    data: { userId, type, title, message, link },
  });
}

// Called when admin assigns a client to a broker
export async function createAssignmentNotification(
  brokerId: string,
  clientName: string,
  clientId: string
): Promise<void> {
  await prisma.notification.create({
    data: {
      userId: brokerId,
      type: "client_assigned",
      title: "Novy klient prirazen",
      message: `${clientName} vam byl prirazen`,
      link: `/clients?open=${clientId}`,
    },
  });
}
