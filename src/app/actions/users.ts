"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  active: boolean;
  signature: string;
  createdAt: string;
}

export async function getUsers(): Promise<UserRow[]> {
  const session = await getSession();
  if (!session) return [];

  // Only admin + supervisor can access
  if (session.role === "broker") return [];

  const users = await prisma.user.findMany({
    orderBy: { firstName: "asc" },
  });

  return users.map((u) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.role.toLowerCase(),
    active: u.active,
    signature: u.signature || "",
    createdAt: u.createdAt.toISOString().split("T")[0],
  }));
}

export async function createUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "administrator") {
    return { success: false, error: "Nemáte oprávnění" };
  }

  // Check unique email
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) {
    return { success: false, error: "Email je již registrován" };
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      role: data.role.toUpperCase() as "ADMINISTRATOR" | "SUPERVISOR" | "BROKER",
      active: true,
    },
  });

  revalidatePath("/users");
  return { success: true };
}

export async function updateUser(
  id: string,
  data: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    password?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "administrator") {
    return { success: false, error: "Nemáte oprávnění" };
  }

  // Check unique email (excluding self)
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing && existing.id !== id) {
    return { success: false, error: "Email je již registrován" };
  }

  const updateData: Record<string, unknown> = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    role: data.role.toUpperCase() as "ADMINISTRATOR" | "SUPERVISOR" | "BROKER",
  };

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  await prisma.user.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/users");
  return { success: true };
}

export async function toggleUserActive(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "administrator") {
    return { success: false, error: "Nemáte oprávnění" };
  }

  if (id === session.id) {
    return { success: false, error: "Nelze deaktivovat sám sebe" };
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return { success: false, error: "Uživatel nenalezen" };

  await prisma.user.update({
    where: { id },
    data: { active: !user.active },
  });

  revalidatePath("/users");
  return { success: true };
}

export async function deleteUser(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "administrator") {
    return { success: false, error: "Nemáte oprávnění" };
  }

  if (id === session.id) {
    return { success: false, error: "Nelze smazat sám sebe" };
  }

  // Check if user has clients
  const clientCount = await prisma.client.count({
    where: { assignedTo: id },
  });
  if (clientCount > 0) {
    return {
      success: false,
      error: `Uživatel má přiřazených ${clientCount} klientů. Nejprve je přeřaďte.`,
    };
  }

  await prisma.user.delete({ where: { id } });

  revalidatePath("/users");
  return { success: true };
}
