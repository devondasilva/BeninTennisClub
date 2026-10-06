import { randomInt } from "crypto";

/** Mot de passe provisoire lisible (sans caractères ambigus) */
export function tempPassword(len = 10) {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from({ length: len }, () => chars[randomInt(chars.length)]).join("");
}
