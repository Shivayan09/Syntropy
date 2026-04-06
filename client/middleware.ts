import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const isAuthPage =
    req.nextUrl.pathname.startsWith("/auth/login") ||
    req.nextUrl.pathname.startsWith("/auth/register");

  const isProtected =
    req.nextUrl.pathname.startsWith("/main");

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/main/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/main/:path*", "/auth/login", "/auth/register"],
};