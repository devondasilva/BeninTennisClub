import { NextResponse } from "next/server";
import { db } from "@/db";
import { apiSession } from "@/lib/auth";
import { bad } from "@/lib/api";
import { completeTransaction, createTransaction } from "@/lib/payments";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await apiSession();
  if (error) return error;
  const { id } = await params;
  const event = db.events.get(id);
  if (!event) return bad("Événement introuvable", 404);
  if (event.status !== "ACTIVE") return bad("Cet événement est annulé");
  if (event.startDate < new Date()) return bad("Les inscriptions sont closes");

  // Une seule inscription par membre et par événement
  const existing = db.eventRegistrations.find((r) => r.eventId === id && r.userId === session.userId);
  if (existing?.status === "CONFIRMED") return bad("Vous êtes déjà inscrit(e)");
  if (existing) {
    const tx = db.transactions.find((t) => t.relatedId === existing.id && t.status === "PENDING");
    if (tx) return NextResponse.json({ paymentUrl: `/dashboard/payments/${tx.id}` });
  }

  // Capacité : seules les inscriptions confirmées occupent une place
  const n = db.eventRegistrations.count((r) => r.eventId === id && r.status === "CONFIRMED");
  if (n >= event.capacity) return bad("Complet ! Plus aucune place disponible");

  const reg = existing ?? db.eventRegistrations.insert({ eventId: id, userId: session.userId });
  const tx = await createTransaction(session.userId, "EVENT", reg.id, event.price, `Inscription — ${event.title}`);
  if (event.price === 0) {
    await completeTransaction(tx.id, "FREE");
    return NextResponse.json({ status: "CONFIRMED" });
  }
  return NextResponse.json({ paymentUrl: `/dashboard/payments/${tx.id}` });
}
