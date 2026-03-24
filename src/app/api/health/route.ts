import { NextResponse } from "next/server";

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
  const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim();
  const dbUrl = process.env.DATABASE_URL;

  const env = {
    tursoUrlPrefix: tursoUrl?.substring(0, 30),
    tursoTokenPrefix: tursoToken?.substring(0, 20),
    databaseUrl: dbUrl?.substring(0, 30),
    nodeEnv: process.env.NODE_ENV,
  };

  try {
    const { createClient } = await import("@libsql/client");
    const libsql = createClient({
      url: tursoUrl!,
      authToken: tursoToken!,
    });
    const result = await libsql.execute("SELECT count(*) as c FROM User");
    return NextResponse.json({ status: "ok", env, count: result.rows[0] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ status: "error", env, error: msg }, { status: 500 });
  }
}
