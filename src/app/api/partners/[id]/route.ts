import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, t } from "@/db";
import { apiSession, logAction } from "@/lib/auth";
import { bad, parse } from "@/lib/api";
import { partnerSchema, toRow } from "../schema";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await apiSession("partners.manage");
  if (error) return error;
  const { id } = await params;
  const { data, error: e2 } = await parse(req, partnerSchema);
  if (e2) return e2;
  const row = toRow(data);
  if (row.endDate < row.startDate) return bad("La fin du contrat doit être après le début");
  const [p] = await db.update(t.partners).set(row).where(eq(t.partners.id, id)).returning({ id: t.partners.id });
  if (!p) return bad("Partenaire introuvable", 404);
  await logAction(session, data.status === "ACTIVE" ? "Partenaire modifié" : "Partenaire désactivé", data.name);
  return NextResponse.json({ message: "Partenaire enregistré" });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await apiSession("partners.manage");
  if (error) return error;
  const { id } = await params;
  const [p] = await db.delete(t.partners).where(eq(t.partners.id, id)).returning({ name: t.partners.name });
  if (p) await logAction(session, "Partenaire supprimé", p.name);
  return NextResponse.json({ message: "Partenaire supprimé" });
}
