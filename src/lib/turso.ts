import { PrismaClient } from "@prisma/client";
import { createClient } from "@libsql/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

export function createTursoPrisma(url: string, token: string): PrismaClient {
  const libsql = createClient({ url, authToken: token });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaLibSQL(libsql as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({
    adapter,
    datasourceUrl: url,
  } as any);
}
