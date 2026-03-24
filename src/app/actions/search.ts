"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export interface SearchResult {
  id: string;
  type: "client" | "event" | "user" | "nav";
  title: string;
  subtitle: string;
  icon: string;
  /** For client results — used to open drawer */
  clientId?: string;
  /** For event results — navigates to calendar on this date */
  date?: string;
  /** For nav results — the route path */
  href?: string;
}

const EVENT_TYPE_MAP: Record<string, string> = {
  CALL: "📞 Hovor",
  PAYMENT: "💰 Platba",
  REMINDER: "🔔 Připomínka",
  INTEREST: "📈 Úrok",
  MEETING: "🤝 Schůzka",
};

export async function globalSearch(query: string): Promise<{
  clients: SearchResult[];
  events: SearchResult[];
  users: SearchResult[];
}> {
  const session = await getSession();
  if (!session || !query.trim()) {
    return { clients: [], events: [], users: [] };
  }

  const q = query.trim();
  const isBroker = session.role === "broker";

  // Search clients
  const clientWhere = {
    AND: [
      isBroker ? { assignedTo: session.id } : {},
      {
        OR: [
          { firstName: { contains: q } },
          { lastName: { contains: q } },
          { email: { contains: q } },
          { phone: { contains: q } },
        ],
      },
    ],
  };

  const rawClients = await prisma.client.findMany({
    where: clientWhere,
    take: 5,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
  });

  const clients: SearchResult[] = rawClients.map((c) => ({
    id: c.id,
    type: "client",
    title: `${c.firstName} ${c.lastName}`,
    subtitle: c.email || c.phone || "",
    icon: "👤",
    clientId: c.id,
  }));

  // Search events
  const eventWhere = {
    AND: [
      isBroker ? { userId: session.id } : {},
      {
        OR: [
          { title: { contains: q } },
          {
            client: {
              OR: [
                { firstName: { contains: q } },
                { lastName: { contains: q } },
              ],
            },
          },
        ],
      },
    ],
  };

  const rawEvents = await prisma.calEvent.findMany({
    where: eventWhere,
    take: 5,
    orderBy: { date: "desc" },
    select: {
      id: true,
      title: true,
      type: true,
      date: true,
      client: { select: { firstName: true, lastName: true } },
    },
  });

  const events: SearchResult[] = rawEvents.map((e) => ({
    id: e.id,
    type: "event",
    title: e.title,
    subtitle: `${EVENT_TYPE_MAP[e.type] || e.type} · ${e.date}${e.client ? ` · ${e.client.firstName} ${e.client.lastName}` : ""}`,
    icon: "📅",
    date: e.date,
  }));

  // Search users (admin + supervisor only)
  let users: SearchResult[] = [];
  if (!isBroker) {
    const rawUsers = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: q } },
          { lastName: { contains: q } },
        ],
      },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    users = rawUsers.map((u) => ({
      id: u.id,
      type: "user",
      title: `${u.firstName} ${u.lastName}`,
      subtitle: u.email,
      icon: "🧑‍💼",
      href: "/users",
    }));
  }

  return { clients, events, users };
}
