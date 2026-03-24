"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createSession, deleteSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { logAudit } from "./audit";
import type { Role } from "@/lib/types";

const ROLE_MAP: Record<string, Role> = {
  ADMINISTRATOR: "administrator",
  SUPERVISOR: "supervisor",
  BROKER: "broker",
};

export async function login(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Vyplňte email a heslo." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.active) {
    return { error: "Nesprávný email nebo heslo." };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return { error: "Nesprávný email nebo heslo." };
  }

  await createSession({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: ROLE_MAP[user.role] || "broker",
  });

  await logAudit(user.id, "LOGIN", "user", user.id, `${user.firstName} ${user.lastName}`);

  redirect("/dashboard");
}

export async function logout() {
  const session = await getSession();
  if (session) {
    await logAudit(session.id, "LOGOUT", "user", session.id, `${session.firstName} ${session.lastName}`);
  }
  await deleteSession();
  redirect("/login");
}
