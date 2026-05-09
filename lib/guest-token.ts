import { createHash, randomBytes } from "crypto";

export function hashGuestToken(raw: string) {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

export function generateGuestRawToken() {
  return randomBytes(24).toString("base64url");
}
