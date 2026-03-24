"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Helper pro logování auditních záznamů — volá se z ostatních actions
export async function logAudit(
  userId: string,
  action: string,
  entity: string,
  entityId?: string,
  details?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId: entityId ?? null,
        details: details ?? null,
      },
    });
  } catch {
    // Audit log by neměl nikdy blokovat hlavní operaci
    console.error("Failed to create audit log");
  }
}

// Filtry pro audit log stránku
interface AuditFilters {
  userId?: string;
  action?: string;
  entity?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
}

export async function getAuditLogs(filters: AuditFilters = {}) {
  const session = await getSession();
  if (!session || session.role !== "administrator") {
    return { logs: [], total: 0, hasMore: false };
  }

  const take = 20;
  const skip = ((filters.page ?? 1) - 1) * take;

  const where: Record<string, unknown> = {};

  if (filters.userId) {
    where.userId = filters.userId;
  }
  if (filters.action) {
    where.action = filters.action;
  }
  if (filters.entity) {
    where.entity = filters.entity;
  }
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) {
      (where.createdAt as Record<string, unknown>).gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setDate(to.getDate() + 1);
      (where.createdAt as Record<string, unknown>).lt = to;
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: take + 1,
      skip,
    }),
    prisma.auditLog.count({ where }),
  ]);

  const hasMore = logs.length > take;
  const trimmed = hasMore ? logs.slice(0, take) : logs;

  return {
    logs: trimmed.map((log) => ({
      id: log.id,
      userId: log.userId,
      userName: `${log.user.firstName} ${log.user.lastName}`,
      userEmail: log.user.email,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      details: log.details,
      createdAt: log.createdAt.toISOString(),
    })),
    total,
    hasMore,
  };
}

export async function getAuditUsers() {
  const session = await getSession();
  if (!session || session.role !== "administrator") return [];

  return prisma.user.findMany({
    select: { id: true, firstName: true, lastName: true },
    orderBy: { lastName: "asc" },
  });
}
