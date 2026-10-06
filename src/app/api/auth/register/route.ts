import { z } from "zod";
import { db } from "@/db";
import { bad, parse } from "@/lib/api";
import { notify } from "@/lib/notify";
import { hashPassword } from "@/lib/password";
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
  // E-mail unique
  if (db.users.find((u) => u.email === email)) return bad("Un compte existe déjà avec cet e-mail", 409);
  const user = db.users.insert({ ...data, email, password: hashPassword(data.password) });
  await notify(user.id, "WELCOME", "Bienvenue au Bénin Tennis Club !", "Votre compte est créé. Réservez votre premier court dès maintenant.", "/dashboard/reservations/new");
  return sessionResponse(user, { message: "Compte créé" }, 201);
}
