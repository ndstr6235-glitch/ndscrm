import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
  const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (tursoUrl && tursoToken) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const libsqlClient = require("@libsql/client");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const prismaLibsql = require("@prisma/adapter-libsql");

    const libsql = libsqlClient.createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });
    const adapter = new prismaLibsql.PrismaLibSQL(libsql);
    return new PrismaClient({ adapter } as never);
  }

  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
