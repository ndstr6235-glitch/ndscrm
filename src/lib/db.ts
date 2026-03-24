import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  _prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  if (globalForPrisma._prisma) return globalForPrisma._prisma;

  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
  const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (tursoUrl && tursoToken) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createTursoPrisma } = require("./turso");
    globalForPrisma._prisma = createTursoPrisma(tursoUrl, tursoToken) as PrismaClient;
  } else {
    globalForPrisma._prisma = new PrismaClient();
  }

  return globalForPrisma._prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string) {
    const client = getPrismaClient();
    const value = (client as unknown as Record<string, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
