import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fmtCZK } from "@/lib/utils";
import { Users, Landmark, TrendingUp, CalendarClock } from "lucide-react";
import StatCard from "@/components/dashboard/stat-card";
import RecentClients from "@/components/dashboard/recent-clients";
import UpcomingEvents from "@/components/dashboard/upcoming-events";
import TopBrokers from "@/components/dashboard/top-brokers";
import DepositsChart from "@/components/dashboard/deposits-chart";
import ProfitChart from "@/components/dashboard/profit-chart";
import MyDay from "@/components/dashboard/my-day";
import PipelineFunnel from "@/components/dashboard/pipeline-funnel";
import { getChartData } from "@/app/actions/charts";
import { getMyDayData } from "@/app/actions/my-day";
import type { EventType } from "@/lib/types";

const EVENT_TYPE_MAP: Record<string, EventType> = {
  CALL: "call",
  PAYMENT: "payment",
  REMINDER: "reminder",
  INTEREST: "interest",
  MEETING: "meeting",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const isBroker = session.role === "broker";
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const future = new Date(now);
  future.setDate(future.getDate() + 7);
  const in7Days = future.toISOString().split("T")[0];

  const brokerWhere = isBroker ? { assignedTo: session.id } : {};
  const eventWhere = isBroker ? { userId: session.id } : {};

  // Counts
  const clientCount = await prisma.client.count({ where: brokerWhere });
  const investorCount = await prisma.client.count({
    where: { ...brokerWhere, payments: { some: {} } },
  });

  // Aggregates
  const depositsAgg = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: isBroker ? { client: { assignedTo: session.id } } : undefined,
  });
  const profitAgg = await prisma.payment.aggregate({
    _sum: { profit: true },
    where: isBroker ? { client: { assignedTo: session.id } } : undefined,
  });
  const totalDeposits = depositsAgg._sum.amount ?? 0;
  const totalProfit = profitAgg._sum.profit ?? 0;

  // Upcoming events
  const rawEvents = await prisma.calEvent.findMany({
    where: {
      ...eventWhere,
      date: { gte: today, lte: in7Days },
    },
    include: { client: { select: { firstName: true, lastName: true } } },
    orderBy: [{ date: "asc" }, { time: "asc" }],
    take: 10,
  });
  const upcomingEvents = rawEvents.map((e) => ({
    id: e.id,
    type: EVENT_TYPE_MAP[e.type] || ("call" as EventType),
    title: e.title,
    date: e.date,
    time: e.time,
    clientName: e.client
      ? `${e.client.firstName} ${e.client.lastName}`
      : undefined,
  }));

  // Recent clients
  const rawClients = await prisma.client.findMany({
    where: brokerWhere,
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { payments: { select: { amount: true } } },
  });
  const recentClients = rawClients.map((c) => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName}`,
    isInvestor: c.payments.length > 0,
    totalDeposit: c.payments.reduce((s, p) => s + p.amount, 0),
  }));

  // Chart data
  const chartData = await getChartData();

  // My Day data
  const myDayData = await getMyDayData();

  // Pipeline counts
  const allClientsForPipeline = await prisma.client.findMany({
    where: brokerWhere,
    select: { stage: true },
  });
  const pipelineCounts: Record<string, number> = {};
  for (const c of allClientsForPipeline) {
    pipelineCounts[c.stage] = (pipelineCounts[c.stage] || 0) + 1;
  }

  // Top brokers (admin/supervisor only)
  let topBrokers: { name: string; totalProfit: number; clientCount: number }[] =
    [];
  if (!isBroker) {
    const brokers = await prisma.user.findMany({
      where: { role: "BROKER", active: true },
      include: {
        clients: { include: { payments: { select: { profit: true } } } },
      },
    });
    topBrokers = brokers
      .map((b) => ({
        name: `${b.firstName} ${b.lastName}`,
        totalProfit: b.clients.reduce(
          (sum, c) => sum + c.payments.reduce((s, p) => s + p.profit, 0),
          0
        ),
        clientCount: b.clients.length,
      }))
      .sort((a, b) => b.totalProfit - a.totalProfit);
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl md:text-2xl font-bold text-text">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-text-mid">
          Vítejte zpět, {session.firstName}
        </p>
      </div>

      {/* My Day */}
      <MyDay
        tasks={myDayData.tasks}
        followUps={myDayData.followUps}
        isCompanyView={!isBroker}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
        <StatCard
          label="Klientů"
          value={clientCount.toString()}
          subtitle={`${investorCount} investorů`}
          accentColor="sapphire"
          icon={<Users size={16} />}
        />
        <StatCard
          label="Celkové vklady"
          value={fmtCZK(totalDeposits)}
          subtitle={`${investorCount} investorů`}
          accentColor="emerald"
          icon={<Landmark size={16} />}
        />
        <StatCard
          label="Výdělek"
          value={fmtCZK(totalProfit)}
          subtitle={isBroker ? "můj výdělek" : "celkový výdělek"}
          accentColor="gold"
          icon={<TrendingUp size={16} />}
        />
        <StatCard
          label="Nadcházející události"
          value={upcomingEvents.length.toString()}
          subtitle="příštích 7 dní"
          accentColor="amber"
          icon={<CalendarClock size={16} />}
        />
      </div>

      {/* Charts + Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <DepositsChart data={chartData} />
        <ProfitChart data={chartData} />
        <PipelineFunnel counts={pipelineCounts} />
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        <RecentClients clients={recentClients} />
        <UpcomingEvents events={upcomingEvents} />
        <TopBrokers brokers={topBrokers} visible={!isBroker} />
      </div>
    </div>
  );
}
