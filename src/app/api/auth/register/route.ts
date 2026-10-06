import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, t } from "@/db";
import { bad, parse } from "@/lib/api";
import { notify } from "@/lib/notify";
import { sessionResponse } from "../session";

const schema = z.object({
  firstName: z.string().min(2, "Prénom trop court"),
  lastName: z.string().min(2, "Nom trop court"),
  email: z.string().email("E-mail invalide"),
  phone: z.string().min(8, "Téléphone invalide"),
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères"),
  role: z.enum(["CLIENT", "PARENT"]).default("CLIENT"),
});

export async function POST(req: Request) {
  const { data, error } = await parse(req, schema);
  if (error) return error;
  const email = data.email.toLowerCase().trim();
  if (await db.query.users.findFirst({ where: eq(t.users.email, email) })) return bad("Un compte existe déjà avec cet e-mail", 409);
  const [user] = await db
    .insert(t.users)
    .values({ ...data, email, password: await bcrypt.hash(data.password, 10) })
    .returning();
  await notify(user.id, "WELCOME", "Bienvenue au Bénin Tennis Club !", "Votre compte est créé. Réservez votre premier court dès maintenant.", "/dashboard/reservations/new");
  return sessionResponse(user, { message: "Compte créé" }, 201);
}
