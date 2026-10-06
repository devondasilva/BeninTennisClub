import { and, count, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, t } from "@/db";
import { apiSession } from "@/lib/auth";
import { bad } from "@/lib/api";
import { completeTransaction, createTransaction } from "@/lib/payments";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await apiSession();
  if (error) return error;
  const { id } = await params;
  const event = await db.query.events.findFirst({ where: eq(t.events.id, id) });
  if (!event) return bad("Événement introuvable", 404);
  if (event.status !== "ACTIVE") return bad("Cet événement est annulé");
  if (event.startDate < new Date()) return bad("Les inscriptions sont closes");

  const existing = await db.query.eventRegistrations.findFirst({
    where: and(eq(t.eventRegistrations.eventId, id), eq(t.eventRegistrations.userId, session.userId)),
  });
  if (existing?.status === "CONFIRMED") return bad("Vous êtes déjà inscrit(e)");
  if (existing) {
    const tx = await db.query.transactions.findFirst({ where: and(eq(t.transactions.relatedId, existing.id), eq(t.transactions.status, "PENDING")) });
    if (tx) return NextResponse.json({ paymentUrl: `/dashboard/payments/${tx.id}` });
  }

  const [{ n }] = await db.select({ n: count() }).from(t.eventRegistrations)
    .where(and(eq(t.eventRegistrations.eventId, id), eq(t.eventRegistrations.status, "CONFIRMED")));
  if (n >= event.capacity) return bad("Complet ! Plus aucune place disponible");

  const reg = existing ?? (await db.insert(t.eventRegistrations).values({ eventId: id, userId: session.userId }).returning())[0];
  const tx = await createTransaction(session.userId, "EVENT", reg.id, event.price, `Inscription — ${event.title}`);
  if (event.price === 0) {
    await completeTransaction(tx.id, "FREE");
    return NextResponse.json({ status: "CONFIRMED" });
  }
  return NextResponse.json({ paymentUrl: `/dashboard/payments/${tx.id}` });
}
