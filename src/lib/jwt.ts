// Utilisable dans le middleware (Edge) et côté serveur
import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "btc_token";

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

function secret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-btc-change-me");
}

export async function signToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
