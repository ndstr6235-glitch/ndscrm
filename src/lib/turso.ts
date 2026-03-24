import { PrismaClient } from "@prisma/client";
import { createClient } from "@libsql/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

export function createTursoPrisma(url: string, token: string): PrismaClient {
  console.log("[turso] Creating client with url:", url.substring(0, 30) + "...");
  const libsql = createClient({ url, authToken: token });
  console.log("[turso] libsql client created, creating adapter...");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaLibSQL(libsql as any);
  console.log("[turso] adapter created, creating PrismaClient...");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = new PrismaClient({ adapter } as any);
  console.log("[turso] PrismaClient created");
  return client;
}
