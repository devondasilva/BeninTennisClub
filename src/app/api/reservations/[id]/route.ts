import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, t } from "@/db";
import { apiSession } from "@/lib/auth";
import { bad } from "@/lib/api";
import { notify } from "@/lib/notify";
import { dateFr } from "@/lib/format";

// Annulation d'une réservation (jusqu'à 24 h avant, sauf pour l'équipe du club)
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await apiSession();
  if (error) return error;
  const { id } = await params;
  const r = await db.query.reservations.findFirst({ where: eq(t.reservations.id, id), with: { court: true } });
  if (!r) return bad("Réservation introuvable", 404);
  if (r.userId !== session.userId && !session.can("reservations.manage")) return bad("Accès refusé", 403);
  if (!session.can("reservations.manage") && r.startTime.getTime() - Date.now() < 24 * 3600000) return bad("Annulation possible jusqu'à 24 h avant le créneau");

  await db.update(t.reservations).set({ status: "CANCELLED" }).where(eq(t.reservations.id, id));
  await db.delete(t.commissions).where(eq(t.commissions.reservationId, id));
  const [tx] = await db.update(t.transactions).set({ status: "REFUNDED" })
    .where(and(eq(t.transactions.relatedId, id), eq(t.transactions.status, "COMPLETED"))).returning();
  await db.update(t.transactions).set({ status: "FAILED" })
    .where(and(eq(t.transactions.relatedId, id), eq(t.transactions.status, "PENDING")));
  await notify(r.userId, "RESERVATION_CANCELLED", "Réservation annulée",
    `${r.court.name} le ${dateFr(r.startTime)} est annulée.${tx ? " Le remboursement sera effectué sous 5 jours." : ""}`, "/dashboard/reservations");
  return NextResponse.json({ message: "Réservation annulée" });
}
