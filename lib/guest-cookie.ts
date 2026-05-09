import { createHmac, timingSafeEqual } from "crypto";
import { GUEST_COOKIE, GUEST_SESSION_MAX_AGE_SEC } from "@/lib/guest-constants";

export { GUEST_COOKIE, GUEST_SESSION_MAX_AGE_SEC };

function secret() {
  return process.env.GUEST_SESSION_SECRET || process.env.NEXTAUTH_SECRET || "guest-dev-secret";
}

export type GuestCookiePayload = { sub: string; exp: number };

export function signGuestSession(payload: GuestCookiePayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyGuestSession(token: string): GuestCookiePayload | null {
  try {
    const i = token.lastIndexOf(".");
    if (i <= 0) return null;
    const body = token.slice(0, i);
    const sig = token.slice(i + 1);
    const expected = createHmac("sha256", secret()).update(body).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as GuestCookiePayload;
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
