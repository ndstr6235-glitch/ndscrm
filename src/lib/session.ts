import { SignJWT, jwtVerify } from "jose";
import type { Role } from "./types";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "buildfund-crm-dev-secret-key-min-32-chars-here"
);

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
