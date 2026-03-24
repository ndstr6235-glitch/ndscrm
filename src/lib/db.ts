import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
  const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (tursoUrl && tursoToken) {
    // Dynamic require to prevent Turbopack from evaluating at build time
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const libsqlClient = require(/* webpackIgnore: true */ "@libsql/client");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const prismaLibsql = require(/* webpackIgnore: true */ "@prisma/adapter-libsql");

    const libsql = libsqlClient.createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });
    const adapter = new prismaLibsql.PrismaLibSQL(libsql);
    return new PrismaClient({ adapter } as never);
  }

  return new PrismaClient();
}

// Lazy proxy: create client on first property access, not at import time
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }
    return Reflect.get(globalForPrisma.prisma, prop);
  },
});
