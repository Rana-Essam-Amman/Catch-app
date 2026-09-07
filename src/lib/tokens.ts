import { createHash, randomBytes, timingSafeEqual } from "crypto";

export function createVerifyToken() {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function tokenMatches(raw: string, stored: string) {
  const hashed = hashToken(raw);
  const a = Buffer.from(hashed);
  const b = Buffer.from(stored);
  if (a.length === b.length && timingSafeEqual(a, b)) return true;
  const c = Buffer.from(raw);
  const d = Buffer.from(stored);
  return a.length === d.length ? false : c.length === d.length && timingSafeEqual(c, d);
}
