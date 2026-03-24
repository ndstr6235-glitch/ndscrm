import { PrismaClient } from "@prisma/client";
import { createTursoPrisma } from "./turso";

const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim();

export const prisma: PrismaClient =
  tursoUrl && tursoToken
    ? createTursoPrisma(tursoUrl, tursoToken)
    : new PrismaClient();
