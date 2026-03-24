"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getSystemSettings() {
  const session = await getSession();
  if (!session || session.role !== "administrator") return {};

  const settings = await prisma.systemSetting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) {
    // Maskuj API klíč — zobraz jen posledních 8 znaků
    if (s.key.includes("api_key") || s.key.includes("token")) {
      map[s.key] = s.value ? `...${s.value.slice(-8)}` : "";
    } else {
      map[s.key] = s.value;
    }
  }
  return map;
}

export async function updateSystemSetting(key: string, value: string) {
  const session = await getSession();
  if (!session || session.role !== "administrator") {
    return { error: "Pouze administrátor může měnit nastavení." };
  }

  await prisma.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function deleteSystemSetting(key: string) {
  const session = await getSession();
  if (!session || session.role !== "administrator") {
    return { error: "Pouze administrátor." };
  }

  await prisma.systemSetting.deleteMany({ where: { key } });
  revalidatePath("/settings");
  return { success: true };
}
