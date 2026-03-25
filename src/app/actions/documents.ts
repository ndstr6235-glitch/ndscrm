"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { logAudit } from "./audit";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

export interface DocumentRow {
  id: string;
  name: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploaderName: string;
  createdAt: string;
  clientName?: string;
  clientId: string;
}

async function checkAdminOrSupervisor() {
  const session = await getSession();
  if (!session) return null;
  if (session.role === "broker") return null;
  return session;
}

export async function getClientDocuments(
  clientId: string
): Promise<DocumentRow[]> {
  const session = await checkAdminOrSupervisor();
  if (!session) return [];

  const docs = await prisma.document.findMany({
    where: { clientId },
    include: {
      user: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return docs.map((d) => ({
    id: d.id,
    name: d.name,
    fileName: d.fileName,
    fileUrl: d.fileUrl,
    fileSize: d.fileSize,
    mimeType: d.mimeType,
    uploadedBy: d.uploadedBy,
    uploaderName: `${d.user.firstName} ${d.user.lastName}`,
    createdAt: d.createdAt.toISOString(),
    clientId: d.clientId,
  }));
}

export async function uploadDocument(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await checkAdminOrSupervisor();
  if (!session) return { success: false, error: "Nemáte oprávnění" };

  const file = formData.get("file") as File | null;
  const clientId = formData.get("clientId") as string | null;
  const name = formData.get("name") as string | null;

  if (!file || !clientId) {
    return { success: false, error: "Chybí soubor nebo klient" };
  }

  if (file.size > MAX_SIZE) {
    return { success: false, error: "Soubor je příliš velký (max 10MB)" };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: "Nepodporovaný typ souboru (PDF, DOC, DOCX, JPG, PNG)" };
  }

  const ext = file.name.split(".").pop() || "bin";
  const uniqueName = `${randomUUID()}.${ext}`;

  // Ensure upload dir exists
  await mkdir(UPLOAD_DIR, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = join(UPLOAD_DIR, uniqueName);
  await writeFile(filePath, buffer);

  await prisma.document.create({
    data: {
      clientId,
      name: name || file.name,
      fileName: uniqueName,
      fileUrl: `/uploads/${uniqueName}`,
      fileSize: file.size,
      mimeType: file.type,
      uploadedBy: session.id,
    },
  });

  await logAudit(session.id, "CREATE", "document", clientId, name || file.name);

  revalidatePath("/clients");
  return { success: true };
}

export async function deleteDocument(
  documentId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await checkAdminOrSupervisor();
  if (!session) return { success: false, error: "Nemáte oprávnění" };

  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc) return { success: false, error: "Dokument nenalezen" };

  // Delete file from disk
  try {
    await unlink(join(UPLOAD_DIR, doc.fileName));
  } catch {
    // File may not exist, continue
  }

  await prisma.document.delete({ where: { id: documentId } });
  await logAudit(session.id, "DELETE", "document", documentId, doc.name);

  revalidatePath("/clients");
  return { success: true };
}
