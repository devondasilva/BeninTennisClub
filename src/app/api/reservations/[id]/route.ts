import { NextResponse } from "next/server";
import { db } from "@/db";
import { apiSession } from "@/lib/auth";
import { bad } from "@/lib/api";
import { notify } from "@/lib/notify";
import { dateFr } from "@/lib/format";

// Annulation d'une réservation (jusqu'à 24 h avant, sauf pour l'équipe du club)
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await apiSession();
  if (error) return error;
  const { id } = await params;
  const r = db.reservations.get(id);
  const court = r && db.courts.get(r.courtId);
  if (!r || !court) return bad("Réservation introuvable", 404);
  if (r.userId !== session.userId && !session.can("reservations.manage")) return bad("Accès refusé", 403);
  if (!session.can("reservations.manage") && r.startTime.getTime() - Date.now() < 24 * 3600000) return bad("Annulation possible jusqu'à 24 h avant le créneau");

  db.reservations.update(id, { status: "CANCELLED" });
  db.commissions.removeWhere((c) => c.reservationId === id);
  const refunded = db.transactions.updateWhere((t) => t.relatedId === id && t.status === "COMPLETED", { status: "REFUNDED" });
  db.transactions.updateWhere((t) => t.relatedId === id && t.status === "PENDING", { status: "FAILED" });
  await notify(r.userId, "RESERVATION_CANCELLED", "Réservation annulée",
    `${court.name} le ${dateFr(r.startTime)} est annulée.${refunded ? " Le remboursement sera effectué sous 5 jours." : ""}`, "/dashboard/reservations");
  return NextResponse.json({ message: "Réservation annulée" });
}
