import { NextResponse } from "next/server";
import { db } from "@/db";
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
  const e = db.events.update(id, { ...data, startDate, endDate, image: (await storeImage(data.image)) || IMAGES[data.type] });
  if (!e) return bad("Événement introuvable", 404);
  await logAction(session, "Événement modifié", e.title);
  return NextResponse.json({ message: "Événement modifié" });
}

// Annuler (avec inscrits) ou supprimer (sans inscrit) un événement
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await apiSession("events.manage");
  if (error) return error;
  const { id } = await params;
  const e = db.events.get(id);
  if (!e) return bad("Événement introuvable", 404);
  const registrations = db.eventRegistrations.filter((r) => r.eventId === id);
  if (registrations.length === 0) {
    db.eventRegistrations.removeWhere((r) => r.eventId === id); // cascade (aucune inscription ici)
    db.events.remove(id);
    await logAction(session, "Événement supprimé", e.title);
    return NextResponse.json({ message: "Événement supprimé" });
  }
  db.events.update(id, { status: "CANCELLED" });
  for (const r of registrations) {
    db.transactions.updateWhere((t) => t.relatedId === r.id && t.status === "COMPLETED", { status: "REFUNDED" });
    await notify(r.userId, "RESERVATION_CANCELLED", "Événement annulé", `« ${e.title} » du ${dateFr(e.startDate)} est annulé. ${e.price ? "Votre inscription vous sera remboursée sous 5 jours." : ""}`, "/dashboard/events");
  }
  await logAction(session, "Événement annulé", `${e.title} (${registrations.length} inscrits prévenus)`);
  return NextResponse.json({ message: `Événement annulé, ${registrations.length} inscrit(s) prévenu(s)` });
}
