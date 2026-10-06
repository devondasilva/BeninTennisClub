import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { apiSession } from "@/lib/auth";
import { bad, parse } from "@/lib/api";

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(10, "Votre avis doit faire au moins 10 caractères").max(500),
});

// Un avis par membre et par coach : un nouvel envoi remplace le précédent
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await apiSession();
  if (error) return error;
  const { id } = await params;
  const { data, error: e2 } = await parse(req, schema);
  if (e2) return e2;
  const coach = db.coaches.get(id);
  if (!coach) return bad("Coach introuvable", 404);
  if (coach.userId === session.userId) return bad("Vous ne pouvez pas noter votre propre profil");
  const existing = db.coachReviews.find((r) => r.coachId === id && r.userId === session.userId);
  if (existing) {
    db.coachReviews.update(existing.id, { ...data, createdAt: new Date() });
    return NextResponse.json({ message: "Avis mis à jour, merci !" });
  }
  db.coachReviews.insert({ ...data, coachId: id, userId: session.userId });
  return NextResponse.json({ message: "Merci pour votre avis !" }, { status: 201 });
}
