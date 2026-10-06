import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, t } from "@/db";
import { apiSession, logAction } from "@/lib/auth";
import { bad, parse } from "@/lib/api";
import { storeImage } from "@/lib/uploads";
import { courtSchema } from "../schema";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await apiSession("courts.manage");
  if (error) return error;
  const { id } = await params;
  const { data, error: e2 } = await parse(req, courtSchema);
  if (e2) return e2;
  const before = await db.query.courts.findFirst({ where: eq(t.courts.id, id) });
  if (!before) return bad("Court introuvable", 404);
  await db.update(t.courts).set({ ...data, image: (await storeImage(data.image)) ?? before.image }).where(eq(t.courts.id, id));
  const detail = before.pricePerSlot !== data.pricePerSlot ? `${data.name} (prix ${before.pricePerSlot} → ${data.pricePerSlot} XOF / 30 min)` : data.name;
  await logAction(session, data.isActive ? "Court modifié" : "Court fermé à la réservation", detail);
  return NextResponse.json({ message: "Court enregistré" });
}
