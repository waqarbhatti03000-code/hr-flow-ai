import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Lightweight edge-friendly gate: if there is no auth.js session cookie on a
 * protected path, redirect to /login. We do not import the full NextAuth
 * config here because it uses Node APIs (bcryptjs, prisma).
 *
 * Actual role enforcement happens server-side via `requireAuth` / `requireRole`
 * in API routes and server components.
 */

const PROTECTED_PREFIXES = ["/dashboard", "/employees", "/departments", "/ai"];

const AUTH_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isProtected) return NextResponse.next();

  const hasSession = AUTH_COOKIES.some((name) => req.cookies.get(name)?.value);
  if (hasSession) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/employees/:path*", "/departments/:path*", "/ai/:path*"],
};
