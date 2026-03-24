import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const count = await prisma.user.count();
    return NextResponse.json({ status: "ok", userCount: count });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ status: "error", error: msg }, { status: 500 });
  }
}
