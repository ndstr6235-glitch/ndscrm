import { NextResponse } from "next/server";
import { createTursoPrisma } from "@/lib/turso";

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
  const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim();
  const dbUrl = process.env.DATABASE_URL;

  if (!tursoUrl || !tursoToken) {
    return NextResponse.json({ status: "error", error: "Missing env vars", tursoUrl: !!tursoUrl, tursoToken: !!tursoToken });
  }

  try {
    const client = createTursoPrisma(tursoUrl, tursoToken);
    const count = await client.user.count();
    return NextResponse.json({ status: "ok", userCount: count, dbUrl: dbUrl?.substring(0, 20) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ status: "error", error: msg, dbUrl: dbUrl?.substring(0, 20) }, { status: 500 });
  }
}
