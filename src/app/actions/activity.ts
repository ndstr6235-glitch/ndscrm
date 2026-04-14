"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type ActivityType =
  | "CLIENT_CREATED"
  | "CLIENT_UPDATED"
  | "PAYMENT_ADDED"
  | "EMAIL_SENT"
  | "EVENT_CREATED"
  | "NOTE_CHANGED"
  | "ASSIGNED_TO_CHANGED";

export interface ActivityRow {
  id: string;
  type: string;
  description: string;
  userName: string;
  createdAt: string;
}

// ACTIVITY_ICONS moved to @/lib/constants to avoid "use server" export restriction

// ---------------------------------------------------------------------------
// Log activity (called from other server actions)
// ---------------------------------------------------------------------------
export async function logActivity(
  clientId: string,
  userId: string,
  type: ActivityType,
  description: string,
  metadata: Record<string, unknown> = {}
) {
  await prisma.activity.create({
    data: {
      clientId,
      userId,
      type,
      description,
      metadata: JSON.stringify(metadata),
    },
  });
}

// ---------------------------------------------------------------------------
// Get activities for a client (paginated)
// ---------------------------------------------------------------------------
export async function getClientActivities(
  clientId: string,
  take = 20,
  skip = 0
): Promise<{ activities: ActivityRow[]; hasMore: boolean }> {
  const session = await getSession();
  if (!session) return { activities: [], hasMore: false };

  // RBAC check
  if (session.role === "broker") {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { assignedTo: true },
    });
    if (!client || client.assignedTo !== session.id) {
      return { activities: [], hasMore: false };
    }
  }

  const items = await prisma.activity.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    take: take + 1, // fetch one extra to check hasMore
    skip,
    include: {
      user: { select: { firstName: true, lastName: true } },
    },
  });

  const hasMore = items.length > take;
  const trimmed = hasMore ? items.slice(0, take) : items;

  const activities: ActivityRow[] = trimmed.map((a) => ({
    id: a.id,
    type: a.type,
    description: a.description,
    userName: `${a.user.firstName} ${a.user.lastName}`,
    createdAt: a.createdAt.toISOString(),
  }));

  return { activities, hasMore };
}
