/** Edge / Middleware 可用的 HMAC 校验，与 `guest-cookie.ts` 签名格式一致 */

function secret() {
  return process.env.GUEST_SESSION_SECRET || process.env.NEXTAUTH_SECRET || "guest-dev-secret";
}

function base64UrlToUint8(b64url: string): Uint8Array {
  const pad = "=".repeat((4 - (b64url.length % 4)) % 4);
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i++) x |= a[i] ^ b[i];
  return x === 0;
}

export async function verifyGuestSessionEdge(
  token: string
): Promise<{ sub: string; exp: number } | null> {
  const i = token.lastIndexOf(".");
  if (i <= 0) return null;
  const body = token.slice(0, i);
  const sigPart = token.slice(i + 1);
  const enc = new TextEncoder();
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const mac = await crypto.subtle.sign("HMAC", key, enc.encode(body));
    const expected = new Uint8Array(mac);
    const got = base64UrlToUint8(sigPart);
    if (!timingSafeEqual(expected, got)) return null;
    const jsonBytes = base64UrlToUint8(body);
    const json = new TextDecoder().decode(jsonBytes);
    const payload = JSON.parse(json) as { sub?: unknown; exp?: unknown };
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { sub: payload.sub, exp: payload.exp };
  } catch {
    return null;
  }
}
