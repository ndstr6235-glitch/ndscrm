import "server-only";

import { cookies } from "next/headers";
import { encrypt, decrypt, type SessionPayload } from "./session";

const COOKIE_NAME = "session";

export type { SessionPayload };

export async function createSession(
  user: Omit<SessionPayload, "expiresAt">
) {
  const token = await encrypt(user);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return decrypt(token);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
