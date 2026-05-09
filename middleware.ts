import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { GUEST_COOKIE } from "@/lib/guest-constants";
import { verifyGuestSessionEdge } from "@/lib/guest-cookie-edge";

function isBlockedApiForGuest(pathname: string): boolean {
  const prefixes = [
    "/api/growth",
    "/api/redeem",
    "/api/puzzle",
    "/api/student",
    "/api/teacher",
    "/api/parent",
    "/api/messages",
    "/api/register",
    "/api/roster",
    "/api/classes",
    "/api/market/upload",
    "/api/market/trade",
    "/api/ocean",
    "/api/dashboard/class-emotion",
  ];
  if (prefixes.some((p) => pathname.startsWith(p))) return true;
  const activityWrite = [
    "/api/activities/publish",
    "/api/activities/submit",
    "/api/activities/accept",
    "/api/activities/settle",
  ];
  return activityWrite.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isBlockedPageForGuest(pathname: string): boolean {
  if (pathname.startsWith("/growth")) return true;
  if (pathname.startsWith("/redeem")) return true;
  if (pathname.startsWith("/puzzle")) return true;
  if (pathname.startsWith("/register")) return true;
  if (pathname.startsWith("/market/trade")) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const hasNextAuthSession =
    request.cookies.has("next-auth.session-token") ||
    request.cookies.has("__Secure-next-auth.session-token");
  if (hasNextAuthSession) return NextResponse.next();

  const token = request.cookies.get(GUEST_COOKIE)?.value;
  if (!token) return NextResponse.next();

  const guest = await verifyGuestSessionEdge(token);
  if (!guest) return NextResponse.next();

  const path = request.nextUrl.pathname;

  if (path.startsWith("/api/guest") || path.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (path.startsWith("/api/")) {
    if (isBlockedApiForGuest(path)) {
      return NextResponse.json({ error: "访客模式不可使用该功能" }, { status: 403 });
    }
    return NextResponse.next();
  }

  if (isBlockedPageForGuest(path)) {
    const url = request.nextUrl.clone();
    url.pathname = "/guest/limit";
    url.searchParams.set("from", path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
