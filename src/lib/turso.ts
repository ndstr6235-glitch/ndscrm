import { PrismaClient } from "@prisma/client";
import { createClient } from "@libsql/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

export function createTursoPrisma(url: string, token: string): PrismaClient {
  // Prisma runtime reads process.env.DATABASE_URL internally even with adapter.
  // Turbopack inlines it as undefined at build time. Set it at runtime.
  process.env["DATABASE_URL"] = url;

  const libsql = createClient({ url, authToken: token });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaLibSQL(libsql as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any);
}
