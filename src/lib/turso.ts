import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

export function createTursoPrisma(url: string, token: string): PrismaClient {
  const adapter = new PrismaLibSQL({ url, authToken: token });
  return new PrismaClient({ adapter } as never);
}
