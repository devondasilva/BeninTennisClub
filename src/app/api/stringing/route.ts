import { NextResponse } from "next/server";
import { z } from "zod";
import { db, t } from "@/db";
import { apiSession } from "@/lib/auth";
import { bad, parse } from "@/lib/api";
import { createTransaction } from "@/lib/payments";

const STRINGING_BASE = 25000;
const STRINGING_URGENT = 5000;

const schema = z.object({
  racketBrand: z.string().min(2, "Marque requise"),
  racketModel: z.string().min(1, "Modèle requis"),
  stringType: z.enum(["SYNTHETIC", "NATURAL", "HYBRID", "POLYESTER"]),
  tension: z.number().int().min(15).max(80),
  stringPattern: z.enum(["16x19", "18x20", "16x18", "OTHER"]),
  notes: z.string().optional(),
  preferredDate: z.string().min(1, "Date de dépôt requise"),
  urgent: z.boolean(),
});

export async function POST(req: Request) {
  const { session, error } = await apiSession();
  if (error) return error;
  const { data, error: e2 } = await parse(req, schema);
  if (e2) return e2;
  const preferredDate = new Date(data.preferredDate);
  if (preferredDate.getTime() < Date.now() - 86400000) return bad("La date de dépôt doit être aujourd'hui ou plus tard");
  const price = STRINGING_BASE + (data.urgent ? STRINGING_URGENT : 0);
  const [r] = await db.insert(t.stringingRequests).values({ ...data, preferredDate, price, userId: session.userId }).returning();
  const tx = await createTransaction(session.userId, "STRINGING", r.id, price, `Cordage ${data.racketBrand} ${data.racketModel}${data.urgent ? " (urgent)" : ""}`);
  return NextResponse.json({ request: r, paymentUrl: `/dashboard/payments/${tx.id}` }, { status: 201 });
}
