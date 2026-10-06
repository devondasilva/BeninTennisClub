import { z } from "zod";
import { db } from "@/db";
import { bad, parse } from "@/lib/api";
import { verifyPassword } from "@/lib/password";
import { createRateLimiter } from "@/lib/rate-limit";
import { sessionResponse } from "../session";

// 10 tentatives par adresse e-mail et par 15 minutes
const limiter = createRateLimiter({ max: 10, windowMs: 15 * 60 * 1000 });

const schema = z.object({ email: z.string().email("E-mail invalide"), password: z.string().min(1, "Mot de passe requis") });

export async function POST(req: Request) {
  const { data, error } = await parse(req, schema);
  if (error) return error;
  const key = data.email.toLowerCase().trim();
  const wait = limiter.check(key);
  if (wait) return bad(`Trop de tentatives. Réessayez dans ${Math.ceil(wait / 60)} min.`, 429);
  const user = db.users.find((u) => u.email === key);
  if (!user || !verifyPassword(data.password, user.password)) return bad("E-mail ou mot de passe incorrect", 401);
  limiter.reset(key);
  if (user.status !== "ACTIVE") return bad("Ce compte est suspendu. Contactez l'accueil du club.", 403);
  return sessionResponse(user, { message: "Connecté", role: user.role });
}
