import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const env = {
    hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
    hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
    hasSessionSecret: !!process.env.SESSION_SECRET,
    nodeEnv: process.env.NODE_ENV,
  };

  try {
    const count = await prisma.user.count();
    return NextResponse.json({ status: "ok", env, userCount: count });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ status: "error", env, error: msg }, { status: 500 });
  }
}
