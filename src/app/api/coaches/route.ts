import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db, t } from "@/db";
import { apiSession, logAction } from "@/lib/auth";
import { bad, parse } from "@/lib/api";
import { imageField } from "@/lib/images";
import { tempPassword } from "@/lib/password";

const schema = z.object({
  firstName: z.string().trim().min(2, "Prénom trop court"), lastName: z.string().trim().min(2, "Nom trop court"),
  email: z.string().trim().toLowerCase().email("E-mail invalide"), phone: z.string().trim().min(8, "Téléphone invalide"),
  specialization: z.string().trim().min(3, "Indiquez la spécialité"), bio: z.string().trim().optional(),
  languages: z.string().trim().optional(), diplomas: z.string().trim().optional(),
  experience: z.number().int().min(0), hourlyRate: z.number().min(1000, "Tarif horaire invalide"),
  commissionRate: z.number().min(0).max(100, "La commission doit être entre 0 et 100 %"),
  photo: imageField.optional(),
  createAccount: z.boolean().default(true),
});

export async function GET() {
  const coaches = await db.query.coaches.findMany();
  return NextResponse.json({ coaches });
}

// Ajout d'un coach, avec création facultative de son accès à l'espace coach
export async function POST(req: Request) {
  const { session, error } = await apiSession("coaches.manage");
  if (error) return error;
  const { data, error: e2 } = await parse(req, schema);
  if (e2) return e2;
  if (await db.query.coaches.findFirst({ where: eq(t.coaches.email, data.email) })) return bad("Un coach existe déjà avec cet e-mail", 409);

  let userId: string | null = null;
  let password: string | null = null;
  if (data.createAccount) {
    const existing = await db.query.users.findFirst({ where: eq(t.users.email, data.email) });
    if (existing) {
      userId = existing.id;
      if (["CLIENT", "PARENT"].includes(existing.role)) await db.update(t.users).set({ role: "COACH" }).where(eq(t.users.id, existing.id));
    } else {
      password = tempPassword();
      const [u] = await db.insert(t.users).values({
        firstName: data.firstName, lastName: data.lastName, email: data.email, phone: data.phone, role: "COACH",
        password: await bcrypt.hash(password, 10), avatar: data.photo ?? null,
      }).returning();
      userId = u.id;
    }
  }
  const { createAccount, ...fields } = data;
  const [coach] = await db.insert(t.coaches).values({
    ...fields, userId, photo: data.photo ?? `/images/coaches/coach-${(Math.floor(Math.random() * 6) + 1)}.svg`,
    availability: "[]",
  }).returning();
  await logAction(session, "Coach ajouté", `${coach.firstName} ${coach.lastName}`);
  return NextResponse.json({ coach, tempPassword: password, linkedExisting: !!userId && !password }, { status: 201 });
}
