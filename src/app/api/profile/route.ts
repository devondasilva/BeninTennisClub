import { z } from "zod";
import { db, type Coach, type User } from "@/db";
import { apiSession } from "@/lib/auth";
import { bad, parse } from "@/lib/api";
import { imageField } from "@/lib/images";
import { hashPassword, verifyPassword } from "@/lib/password";
import { sessionResponse } from "../auth/session";
import { clean } from "../clean";

const schema = z.object({
  firstName: z.string().trim().min(2, "Prénom trop court"),
  lastName: z.string().trim().min(2, "Nom trop court"),
  email: z.string().trim().toLowerCase().email("E-mail invalide"),
  phone: z.string().trim().min(8, "Téléphone invalide"),
  address: z.string().trim().max(200).optional().nullable(),
  level: z.enum(["DEBUTANT", "INTERMEDIAIRE", "CONFIRME", "COMPETITION"]).optional().nullable(),
  playingHand: z.enum(["RIGHT", "LEFT"]).optional().nullable(),
  bio: z.string().trim().max(300, "300 caractères maximum").optional().nullable(),
  emailNotifications: z.boolean().optional(),
  avatar: imageField.optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "Nouveau mot de passe : 8 caractères minimum").optional().or(z.literal("")),
});

export async function PATCH(req: Request) {
  const { session, error } = await apiSession();
  if (error) return error;
  const { data, error: e2 } = await parse(req, schema);
  if (e2) return e2;
  const user = db.users.get(session.userId);
  if (!user) return bad("Utilisateur introuvable", 404);

  // E-mail unique
  if (data.email !== user.email) {
    const taken = db.users.find((x) => x.email === data.email && x.id !== user.id);
    if (taken) return bad("Cet e-mail est déjà utilisé par un autre compte", 409);
  }

  const { currentPassword, newPassword, ...fields } = data;
  const update: Partial<Omit<User, "id">> = { ...fields, address: fields.address || null, bio: fields.bio || null };
  if (newPassword) {
    if (!currentPassword || !verifyPassword(currentPassword, user.password)) return bad("Mot de passe actuel incorrect");
    update.password = hashPassword(newPassword);
  }
  const u = db.users.update(user.id, clean(update))!;
  // Le coach lié garde le même nom, e-mail et téléphone
  const coachPatch: Partial<Omit<Coach, "id">> = { firstName: u.firstName, lastName: u.lastName, email: u.email };
  if (u.phone) coachPatch.phone = u.phone;
  db.coaches.updateWhere((c) => c.userId === u.id, coachPatch);
  return sessionResponse(u, { message: newPassword ? "Profil et mot de passe mis à jour" : "Profil mis à jour" });
}
