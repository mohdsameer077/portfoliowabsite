import { NextRequest, NextResponse } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(options: { limit: number; windowMs: number }) {
  return function (request: NextRequest): NextResponse | null {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + options.windowMs });
      return null;
    }

    entry.count++;

    if (entry.count > options.limit) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    return null;
  };
}

export const authRateLimit = rateLimit({ limit: 10, windowMs: 15 * 60 * 1000 });
export const apiRateLimit = rateLimit({ limit: 100, windowMs: 15 * 60 * 1000 });
