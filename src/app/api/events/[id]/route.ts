import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, t } from "@/db";
import { apiSession, logAction } from "@/lib/auth";
import { bad, parse } from "@/lib/api";
import { notify } from "@/lib/notify";
import { storeImage } from "@/lib/uploads";
import { dateFr } from "@/lib/format";
import { eventSchema, IMAGES } from "../shared";

// Modifier un événement
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await apiSession("events.manage");
  if (error) return error;
  const { id } = await params;
  const { data, error: e2 } = await parse(req, eventSchema);
  if (e2) return e2;
  const startDate = new Date(data.startDate), endDate = new Date(data.endDate);
  if (endDate < startDate) return bad("La fin doit être après le début");
  const [e] = await db.update(t.events).set({ ...data, startDate, endDate, image: (await storeImage(data.image)) || IMAGES[data.type] }).where(eq(t.events.id, id)).returning();
  if (!e) return bad("Événement introuvable", 404);
  await logAction(session, "Événement modifié", e.title);
  return NextResponse.json({ message: "Événement modifié" });
}

// Annuler (avec inscrits) ou supprimer (sans inscrit) un événement
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await apiSession("events.manage");
  if (error) return error;
  const { id } = await params;
  const e = await db.query.events.findFirst({ where: eq(t.events.id, id), with: { registrations: true } });
  if (!e) return bad("Événement introuvable", 404);
  if (e.registrations.length === 0) {
    await db.delete(t.events).where(eq(t.events.id, id));
    await logAction(session, "Événement supprimé", e.title);
    return NextResponse.json({ message: "Événement supprimé" });
  }
  await db.update(t.events).set({ status: "CANCELLED" }).where(eq(t.events.id, id));
  for (const r of e.registrations) {
    await db.update(t.transactions).set({ status: "REFUNDED" }).where(and(eq(t.transactions.relatedId, r.id), eq(t.transactions.status, "COMPLETED")));
    await notify(r.userId, "RESERVATION_CANCELLED", "Événement annulé", `« ${e.title} » du ${dateFr(e.startDate)} est annulé. ${e.price ? "Votre inscription vous sera remboursée sous 5 jours." : ""}`, "/dashboard/events");
  }
  await logAction(session, "Événement annulé", `${e.title} (${e.registrations.length} inscrits prévenus)`);
  return NextResponse.json({ message: `Événement annulé, ${e.registrations.length} inscrit(s) prévenu(s)` });
}
