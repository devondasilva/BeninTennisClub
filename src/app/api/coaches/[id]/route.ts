import { NextResponse } from "next/server";
import { z } from "zod";
import { db, type Coach } from "@/db";
import { apiSession, logAction } from "@/lib/auth";
import { bad, parse } from "@/lib/api";
import { imageField } from "@/lib/images";
import { DAYS } from "@/lib/coaches";
import { clean } from "../../clean";

const schema = z.object({
  specialization: z.string().trim().min(3, "Spécialité trop courte").max(80),
  bio: z.string().trim().min(20, "Présentez-vous en quelques phrases (20 caractères minimum)").max(1200),
  languages: z.string().trim().max(120).optional().nullable(),
  diplomas: z.string().trim().max(1000).optional().nullable(),
  achievements: z.string().trim().max(1000).optional().nullable(),
  experience: z.number().int().min(0).max(60),
  availability: z.array(z.object({ day: z.enum(DAYS as [string, ...string[]]), hours: z.string().trim().min(3).max(40) })).max(14),
  photo: imageField.optional(),
  // Réservés à l'équipe du club
  hourlyRate: z.number().min(1000).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

// Modification d'une fiche coach : par le coach lui-même ou par l'équipe du club
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await apiSession();
  if (error) return error;
  const { id } = await params;
  const coach = db.coaches.get(id);
  if (!coach) return bad("Coach introuvable", 404);
  const staff = session.can("coaches.manage");
  if (!staff && coach.userId !== session.userId) return bad("Accès refusé", 403);
  const { data, error: e2 } = await parse(req, schema);
  if (e2) return e2;

  const { availability, hourlyRate, commissionRate, status, ...rest } = data;
  const update: Partial<Omit<Coach, "id">> = { ...rest, availability: JSON.stringify(availability) };
  if (staff) Object.assign(update, { hourlyRate, commissionRate, status });
  if (update.photo === null) delete update.photo; // une fiche coach garde toujours une photo
  db.coaches.update(id, clean(update));
  if (staff) await logAction(session, "Fiche coach modifiée", `${coach.firstName} ${coach.lastName}`);
  return NextResponse.json({ message: "Fiche coach mise à jour" });
}
