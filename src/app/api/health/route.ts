import { NextResponse } from "next/server";

export async function GET() {
  // Read all relevant env vars
  const envs = {
    DATABASE_URL: process.env.DATABASE_URL?.substring(0, 30),
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL?.substring(0, 30),
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN?.substring(0, 20),
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json(envs);
}
