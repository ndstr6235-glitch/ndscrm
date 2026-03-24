import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ClientsPageClient from "@/components/clients/clients-page-client";
import type { Prisma } from "@prisma/client";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ClientsRoute({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session) return null;

  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const status = typeof params.status === "string" ? params.status : "all";
  const brokerParam = typeof params.broker === "string" ? params.broker : "all";

  const isBroker = session.role === "broker";

  // Build WHERE clause
  const where: Prisma.ClientWhereInput = {};

  // RBAC: broker sees only own clients
  if (isBroker) {
    where.assignedTo = session.id;
  }

  // Broker filter (admin/supervisor)
  if (!isBroker && brokerParam !== "all") {
    where.assignedTo = brokerParam;
  }

  // Search filter (OR across name, email, phone)
  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ];
  }

  // Status filter
  if (status === "investor") {
    where.payments = { some: {} };
  } else if (status === "prospect") {
    where.payments = { none: {} };
  }

  // Fetch clients
  const rawClients = await prisma.client.findMany({
    where,
    include: {
      payments: { select: { amount: true, profit: true } },
      user: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const clients = rawClients.map((c) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    phone: c.phone,
    email: c.email,
    callDate: c.callDate,
    isInvestor: c.payments.length > 0,
    totalDeposit: c.payments.reduce((s, p) => s + p.amount, 0),
    totalProfit: c.payments.reduce((s, p) => s + p.profit, 0),
    brokerName: `${c.user.firstName} ${c.user.lastName}`,
    brokerId: c.user.id,
  }));

  // Total count (without filters) for header display
  const totalCount = await prisma.client.count({
    where: isBroker ? { assignedTo: session.id } : {},
  });

  // Fetch brokers for filter dropdown (admin/supervisor only)
  let brokers: { id: string; name: string }[] = [];
  if (!isBroker) {
    const rawBrokers = await prisma.user.findMany({
      where: { role: "BROKER", active: true },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    });
    brokers = rawBrokers.map((b) => ({
      id: b.id,
      name: `${b.firstName} ${b.lastName}`,
    }));
  }

  const hasFilters = !!(search || status !== "all" || brokerParam !== "all");

  return (
    <ClientsPageClient
      clients={clients}
      brokers={brokers}
      isBroker={isBroker}
      userRole={session.role as "administrator" | "supervisor" | "broker"}
      totalCount={totalCount}
      hasFilters={hasFilters}
    />
  );
}
