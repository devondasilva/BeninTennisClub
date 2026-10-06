import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { apiSession } from "@/lib/auth";
import { bad, parse } from "@/lib/api";
import { createTransaction } from "@/lib/payments";

const OPEN_HOUR = 6;
const CLOSE_HOUR = 24;

const schema = z.object({
  courtId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  slots: z.number().int().min(2, "Durée minimale : 1 heure").max(6, "Durée maximale : 3 heures"),
  coachId: z.string().optional().nullable(),
});

export async function GET() {
  const { session, error } = await apiSession();
  if (error) return error;
  const list = db.reservations
    .filter((r) => r.userId === session.userId)
    .flatMap((r) => {
      const court = db.courts.get(r.courtId);
      if (!court) return [];
      return [{ ...r, court, coach: r.coachId ? db.coaches.get(r.coachId) ?? null : null }];
    });
  return NextResponse.json({ reservations: list });
}

export async function POST(req: Request) {
  const { session, error } = await apiSession();
  if (error) return error;
  const { data, error: e2 } = await parse(req, schema);
  if (e2) return e2;

  const startTime = new Date(`${data.date}T${data.start}:00`);
  const endTime = new Date(startTime.getTime() + data.slots * 30 * 60000);
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (startTime < tomorrow) return bad("Les réservations se font au moins un jour à l'avance");
  if (startTime.getHours() < OPEN_HOUR || endTime.getTime() > new Date(`${data.date}T00:00:00`).getTime() + CLOSE_HOUR * 3600000)
    return bad("Le club est ouvert de 6 h à minuit");

  const court = db.courts.get(data.courtId);
  if (!court) return bad("Court introuvable", 404);
  const coach = data.coachId ? db.coaches.get(data.coachId) ?? null : null;

  // Chevauchement : le court est déjà pris sur une partie du créneau
  const overlap = db.reservations.find(
    (r) => r.courtId === court.id && r.status !== "CANCELLED" && r.startTime < endTime && r.endTime > startTime
  );
  if (overlap) return bad("Ce créneau vient d'être réservé, choisissez-en un autre", 409);

  // Le coach ne peut pas être sur deux créneaux à la fois
  if (coach) {
    const busy = db.reservations.find(
      (r) => r.coachId === coach.id && r.status !== "CANCELLED" && r.startTime < endTime && r.endTime > startTime
    );
    if (busy) return bad(`${coach.firstName} n'est pas disponible sur ce créneau`, 409);
  }

  const price = data.slots * court.pricePerSlot + (coach ? (coach.hourlyRate * data.slots) / 2 : 0);
  const reservation = db.reservations.insert({ courtId: court.id, userId: session.userId, coachId: coach?.id ?? null, startTime, endTime, price });
  const tx = await createTransaction(session.userId, "RESERVATION", reservation.id, price,
    `Réservation ${court.name}${coach ? ` avec ${coach.firstName} ${coach.lastName}` : ""}`);
  return NextResponse.json({ reservation, paymentUrl: `/dashboard/payments/${tx.id}` }, { status: 201 });
}
