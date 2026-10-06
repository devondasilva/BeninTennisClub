import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, t } from "@/db";
import { apiSession, logAction } from "@/lib/auth";
import { bad, parse } from "@/lib/api";
import { storeImage } from "@/lib/uploads";
import { campaignSchema, IMAGES } from "../shared";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await apiSession("fundraising.manage");
  if (error) return error;
  const { id } = await params;
  const { data, error: e2 } = await parse(req, campaignSchema);
  if (e2) return e2;
  const [c] = await db.update(t.campaigns).set({ ...data, deadline: new Date(`${data.deadline}T23:59:59`), image: (await storeImage(data.image)) || IMAGES[data.category] }).where(eq(t.campaigns.id, id)).returning();
  if (!c) return bad("Collecte introuvable", 404);
  await logAction(session, data.status === "COMPLETED" ? "Collecte clôturée" : "Collecte modifiée", c.title);
  return NextResponse.json({ message: "Collecte enregistrée" });
}
