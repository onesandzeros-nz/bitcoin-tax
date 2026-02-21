import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

function isValidToken(token: string): boolean {
  const password = process.env.LOGIN_PASSWORD;
  if (!password) return true; // No password set = no protection
  const expected = createHmac("sha256", password).update("bitcoin-tax-session").digest("hex");
  return token === expected;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page and login API
  if (pathname === "/login" || pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Check auth cookie
  const token = request.cookies.get("auth_token")?.value;
  if (!token || !isValidToken(token)) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and _next
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
