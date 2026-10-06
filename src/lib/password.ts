import { randomBytes, randomInt, scryptSync, timingSafeEqual } from "crypto";

/**
 * Mots de passe hachés avec scrypt + sel (module crypto de Node.js, aucune dépendance),
 * stockés sous la forme « scrypt:<sel>:<empreinte> ». Même principe que Beach Tennis Bénin.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const a = scryptSync(password, salt, 64);
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Mot de passe provisoire lisible (sans caractères ambigus) */
export function tempPassword(len = 10) {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from({ length: len }, () => chars[randomInt(chars.length)]).join("");
}
