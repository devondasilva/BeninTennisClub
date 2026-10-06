import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db, t } from "@/db";
import { apiSession, logAction, ROLES } from "@/lib/auth";
import { bad, parse } from "@/lib/api";
import { tempPassword } from "@/lib/password";
import { ROLE_LABELS } from "@/lib/roles";

const schema = z.object({
  firstName: z.string().trim().min(2, "Prénom trop court"), lastName: z.string().trim().min(2, "Nom trop court"),
  email: z.string().trim().toLowerCase().email("E-mail invalide"), phone: z.string().trim().min(8, "Téléphone invalide"),
  role: z.enum(ROLES),
});

// Création d'un compte membre par l'équipe du club
export async function POST(req: Request) {
  const { session, error } = await apiSession("members.manage");
  if (error) return error;
  const { data, error: e2 } = await parse(req, schema);
  if (e2) return e2;
  if (!["CLIENT", "PARENT"].includes(data.role) && !session.can("access.manage")) return bad("Seul l'administrateur peut créer un compte avec ce rôle", 403);
  if (await db.query.users.findFirst({ where: eq(t.users.email, data.email) })) return bad("Un compte existe déjà avec cet e-mail", 409);
  const password = tempPassword();
  const [u] = await db.insert(t.users).values({ ...data, password: await bcrypt.hash(password, 10) }).returning();
  await logAction(session, "Compte créé", `${u.firstName} ${u.lastName} (${ROLE_LABELS[u.role]})`);
  return NextResponse.json({ id: u.id, tempPassword: password }, { status: 201 });
}
