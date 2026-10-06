import bcrypt from "bcryptjs";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db, t } from "@/db";
import { apiSession } from "@/lib/auth";
import { bad, parse } from "@/lib/api";
import { imageField } from "@/lib/images";
import { sessionResponse } from "../auth/session";

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
  const user = await db.query.users.findFirst({ where: eq(t.users.id, session.userId) });
  if (!user) return bad("Utilisateur introuvable", 404);

  if (data.email !== user.email) {
    const taken = await db.query.users.findFirst({ where: and(eq(t.users.email, data.email), ne(t.users.id, user.id)) });
    if (taken) return bad("Cet e-mail est déjà utilisé par un autre compte", 409);
  }

  const { currentPassword, newPassword, ...fields } = data;
  const update: Partial<typeof t.users.$inferInsert> = { ...fields, address: fields.address || null, bio: fields.bio || null };
  if (newPassword) {
    if (!currentPassword || !(await bcrypt.compare(currentPassword, user.password))) return bad("Mot de passe actuel incorrect");
    update.password = await bcrypt.hash(newPassword, 10);
  }
  const [u] = await db.update(t.users).set(update).where(eq(t.users.id, user.id)).returning();
  // Le coach lié garde le même nom, e-mail et téléphone
  await db.update(t.coaches).set({ firstName: u.firstName, lastName: u.lastName, phone: u.phone ?? undefined, email: u.email }).where(eq(t.coaches.userId, u.id));
  return sessionResponse(u, { message: newPassword ? "Profil et mot de passe mis à jour" : "Profil mis à jour" });
}
