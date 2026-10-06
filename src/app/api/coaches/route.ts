import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { apiSession, logAction } from "@/lib/auth";
import { bad, parse } from "@/lib/api";
import { imageField } from "@/lib/images";
import { hashPassword, tempPassword } from "@/lib/password";

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
  const coaches = db.coaches.all();
  return NextResponse.json({ coaches });
}

// Ajout d'un coach, avec création facultative de son accès à l'espace coach
export async function POST(req: Request) {
  const { session, error } = await apiSession("coaches.manage");
  if (error) return error;
  const { data, error: e2 } = await parse(req, schema);
  if (e2) return e2;
  // E-mail unique parmi les coachs
  if (db.coaches.find((c) => c.email === data.email)) return bad("Un coach existe déjà avec cet e-mail", 409);

  let userId: string | null = null;
  let password: string | null = null;
  if (data.createAccount) {
    const existing = db.users.find((u) => u.email === data.email);
    if (existing) {
      // Un compte ne peut être lié qu'à une seule fiche coach
      if (db.coaches.find((c) => c.userId === existing.id)) return bad("Un coach existe déjà avec cet e-mail", 409);
      userId = existing.id;
      if (["CLIENT", "PARENT"].includes(existing.role)) db.users.update(existing.id, { role: "COACH" });
    } else {
      password = tempPassword();
      const u = db.users.insert({
        firstName: data.firstName, lastName: data.lastName, email: data.email, phone: data.phone, role: "COACH",
        password: hashPassword(password), avatar: data.photo ?? null,
      });
      userId = u.id;
    }
  }
  const { createAccount, ...fields } = data;
  void createAccount;
  const coach = db.coaches.insert({
    ...fields, userId, photo: data.photo ?? `/images/coaches/coach-${(Math.floor(Math.random() * 6) + 1)}.svg`,
    availability: "[]",
  });
  await logAction(session, "Coach ajouté", `${coach.firstName} ${coach.lastName}`);
  return NextResponse.json({ coach, tempPassword: password, linkedExisting: !!userId && !password }, { status: 201 });
}
