import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  _prisma: PrismaClient | undefined;
};

export function getPrismaClient(): PrismaClient {
  if (globalForPrisma._prisma) return globalForPrisma._prisma;

  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
  const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (tursoUrl && tursoToken) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
    const libsqlClient: any = require("@libsql/client");
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
    const prismaLibsql: any = require("@prisma/adapter-libsql");

    const libsql = libsqlClient.createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });
    const adapter = new prismaLibsql.PrismaLibSQL(libsql);
    globalForPrisma._prisma = new PrismaClient({ adapter } as never);
  } else {
    globalForPrisma._prisma = new PrismaClient();
  }

  return globalForPrisma._prisma;
}

// Lazy getter — prisma client is only created when first accessed
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
