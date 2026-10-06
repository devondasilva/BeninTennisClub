import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, t } from "@/db";
import { apiSession, logAction } from "@/lib/auth";
import { bad } from "@/lib/api";
import { tempPassword } from "@/lib/password";

// Réinitialise le mot de passe d'un membre et renvoie un mot de passe provisoire
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await apiSession("members.manage");
  if (error) return error;
  const { id } = await params;
  const u = await db.query.users.findFirst({ where: eq(t.users.id, id) });
  if (!u) return bad("Membre introuvable", 404);
  if (u.role === "ADMIN" && !session.isAdmin) return bad("Seul un administrateur peut réinitialiser ce compte", 403);
  const password = tempPassword();
  await db.update(t.users).set({ password: await bcrypt.hash(password, 10) }).where(eq(t.users.id, id));
  await logAction(session, "Mot de passe réinitialisé", `${u.firstName} ${u.lastName}`);
  return NextResponse.json({ tempPassword: password });
}
