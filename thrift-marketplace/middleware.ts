import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

const publicRoutes = ["/", "/login", "/register"];
const authOnlyRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token")?.value;
  let user = null;

  if (token) {
    try {
      user = verifyToken(token);
    } catch {
      // Invalid token — clear it
    }
  }

  // Redirect logged-in users away from auth pages
  if (authOnlyRoutes.some((r) => pathname.startsWith(r)) && user) {
    return NextResponse.redirect(new URL(getDashboard(user.role), request.url));
  }

  // Protect seller routes
  if (pathname.startsWith("/seller")) {
    if (!user) return NextResponse.redirect(new URL("/login", request.url));
    if (user.role !== "seller" && user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!user) return NextResponse.redirect(new URL("/login", request.url));
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Protect buyer-only routes
  if (pathname.startsWith("/orders") || pathname.startsWith("/cart")) {
    if (!user) return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

function getDashboard(role: string) {
  if (role === "admin") return "/admin";
  if (role === "seller") return "/seller";
  return "/";
}

export const config = {
  matcher: [
    "/seller/:path*",
    "/admin/:path*",
    "/orders/:path*",
    "/cart/:path*",
    "/login",
    "/register",
  ],
};
