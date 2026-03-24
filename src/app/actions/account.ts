"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function changePassword(currentPassword: string, newPassword: string) {
  const session = await getSession();
  if (!session) return { error: "Nepřihlášen." };

  if (!currentPassword || !newPassword) {
    return { error: "Vyplňte obě pole." };
  }

  if (newPassword.length < 6) {
    return { error: "Nové heslo musí mít alespoň 6 znaků." };
  }

  // Načti uživatele s heslem
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { password: true },
  });

  if (!user) return { error: "Uživatel nenalezen." };

  // Ověř současné heslo
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return { error: "Současné heslo je nesprávné." };

  // Hashuj a ulož nové heslo
  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: session.id },
    data: { password: hashed },
  });

  revalidatePath("/");
  return { success: true };
}
