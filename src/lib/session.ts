import { SignJWT, jwtVerify } from "jose";
import type { Role } from "./types";

if (!process.env.SESSION_SECRET) {
  throw new Error(
    "SESSION_SECRET environment variable is required. Set it to a random string of at least 32 characters."
  );
}

const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

export interface SessionPayload {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  expiresAt: Date;
}

export async function encrypt(
  payload: Omit<SessionPayload, "expiresAt">
): Promise<string> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return new SignJWT({ ...payload, expiresAt } as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(secret);
}

export async function decrypt(
  session: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
