// Jetons de session signés (HMAC-SHA256) avec l'API Web Crypto native :
// aucune dépendance, utilisable dans le middleware (Edge) comme côté serveur.
// Même principe que Beach Tennis Bénin.

export const COOKIE_NAME = "btc_token";
const DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 jours

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

const secret = () => process.env.JWT_SECRET || "dev-secret-btc-change-me";

function b64urlFromBytes(bytes: Uint8Array): string {
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function bytesFromB64url(input: string): Uint8Array {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(input.length + ((4 - (input.length % 4)) % 4), "=");
  const str = atob(padded);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
}

async function sign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return b64urlFromBytes(new Uint8Array(sig));
}

export async function signToken(payload: SessionPayload): Promise<string> {
  const body = b64urlFromBytes(new TextEncoder().encode(JSON.stringify({ ...payload, exp: Date.now() + DURATION_MS })));
  return `${body}.${await sign(body)}`;
}

export async function verifyToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  if ((await sign(body)) !== signature) return null;
  try {
    const p = JSON.parse(new TextDecoder().decode(bytesFromB64url(body))) as SessionPayload & { exp: number };
    if (!p.exp || p.exp < Date.now()) return null;
    return { userId: p.userId, email: p.email, role: p.role, firstName: p.firstName, lastName: p.lastName };
  } catch {
    return null;
  }
}
