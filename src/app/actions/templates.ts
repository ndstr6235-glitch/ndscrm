"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface TemplateRow {
  id: string;
  label: string;
  subject: string;
  body: string;
  allowedRoles: string[];
}

export async function getTemplates(): Promise<TemplateRow[]> {
  const session = await getSession();
  if (!session || session.role !== "administrator") return [];

  const templates = await prisma.emailTemplate.findMany({
    orderBy: { label: "asc" },
  });

  return templates.map((t) => ({
    id: t.id,
    label: t.label,
    subject: t.subject,
    body: t.body,
    allowedRoles: t.allowedRoles.split(",").map((r) => r.trim().toLowerCase()),
  }));
}

export async function createTemplate(data: {
  label: string;
  subject: string;
  body: string;
  allowedRoles: string[];
}): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "administrator") {
    return { success: false, error: "Nemáte oprávnění" };
  }

  await prisma.emailTemplate.create({
    data: {
      label: data.label,
      subject: data.subject,
      body: data.body,
      allowedRoles: data.allowedRoles.map((r) => r.toUpperCase()).join(","),
    },
  });

  revalidatePath("/templates");
  revalidatePath("/emails");
  return { success: true };
}

export async function updateTemplate(
  id: string,
  data: {
    label: string;
    subject: string;
    body: string;
    allowedRoles: string[];
  }
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "administrator") {
    return { success: false, error: "Nemáte oprávnění" };
  }

  await prisma.emailTemplate.update({
    where: { id },
    data: {
      label: data.label,
      subject: data.subject,
      body: data.body,
      allowedRoles: data.allowedRoles.map((r) => r.toUpperCase()).join(","),
    },
  });

  revalidatePath("/templates");
  revalidatePath("/emails");
  return { success: true };
}

export async function deleteTemplate(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "administrator") {
    return { success: false, error: "Nemáte oprávnění" };
  }

  await prisma.emailTemplate.delete({ where: { id } });

  revalidatePath("/templates");
  revalidatePath("/emails");
  return { success: true };
}
