import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, t } from "@/db";
import { bad, parse } from "@/lib/api";
import { sessionResponse } from "../session";

const schema = z.object({ email: z.string().email("E-mail invalide"), password: z.string().min(1, "Mot de passe requis") });

export async function POST(req: Request) {
  const { data, error } = await parse(req, schema);
  if (error) return error;
  const user = await db.query.users.findFirst({ where: eq(t.users.email, data.email.toLowerCase().trim()) });
  if (!user || !(await bcrypt.compare(data.password, user.password))) return bad("E-mail ou mot de passe incorrect", 401);
  if (user.status !== "ACTIVE") return bad("Ce compte est suspendu. Contactez l'accueil du club.", 403);
  return sessionResponse(user, { message: "Connecté", role: user.role });
}
