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
    if (!process.env.SESSION_SECRET) {
      throw new Error(
        "SESSION_SECRET environment variable is required. Set it to a random string of at least 32 characters."
      );
    }
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
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
