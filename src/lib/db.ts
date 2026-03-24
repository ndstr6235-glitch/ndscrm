import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

async function createPrismaClientAsync(): Promise<PrismaClient> {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
  const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (tursoUrl && tursoToken) {
    const { createClient } = await import("@libsql/client");
    const { PrismaLibSQL } = await import("@prisma/adapter-libsql");

    const libsql = createClient({ url: tursoUrl, authToken: tursoToken });
    const adapter = new PrismaLibSQL(libsql as never);
    return new PrismaClient({ adapter } as never);
  }

  return new PrismaClient();
}

// Lazy async proxy — defers Prisma client creation to first use at runtime
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (globalForPrisma.prisma) {
      return Reflect.get(globalForPrisma.prisma, prop);
    }

    // Return an async wrapper for any method call
    if (typeof prop === "string" && prop.startsWith("$")) {
      return Reflect.get({} as PrismaClient, prop);
    }

    // For model accessors (user, client, etc.), return a proxy that awaits init
    return new Proxy(
      {},
      {
        get(_t, method) {
          return async (...args: unknown[]) => {
            if (!globalForPrisma.prisma) {
              globalForPrisma.prisma = await createPrismaClientAsync();
            }
            const model = (globalForPrisma.prisma as never)[prop as string];
            return (model as never)[method as string](...args);
          };
        },
      }
    );
  },
});
