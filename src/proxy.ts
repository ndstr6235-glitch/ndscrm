import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  const isLoginPage = pathname === "/login";
  const isRoot = pathname === "/";

  if (token) {
    // Inline decrypt — avoid importing from lib which may pull in non-edge deps
    const secret = new TextEncoder().encode(
      process.env.SESSION_SECRET || "buildfund-crm-dev-secret-key-min-32-chars-here"
    );
    let session = null;
    try {
      const { payload } = await jwtVerify(token, secret);
      session = payload;
    } catch {
      session = null;
    }
    if (session) {
      if (isLoginPage || isRoot) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return NextResponse.next();
    }
  }

  // No valid session
  if (!isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|sw\\.js|icons|uploads|offline\\.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)",
  ],
};
