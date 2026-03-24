import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@libsql/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
  const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (!tursoUrl || !tursoToken) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  try {
    // Step 1: test raw libsql
    const libsql = createClient({ url: tursoUrl, authToken: tursoToken });
    const raw = await libsql.execute("SELECT count(*) as c FROM User");

    // Step 2: test Prisma with adapter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adapter = new PrismaLibSQL(libsql as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prisma = new PrismaClient({ adapter } as any);
    const count = await prisma.user.count();

    return NextResponse.json({
      status: "ok",
      rawCount: raw.rows[0],
      prismaCount: count,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? `${e.message}\n${e.stack}` : String(e);
    return NextResponse.json({ status: "error", error: msg }, { status: 500 });
  }
}
