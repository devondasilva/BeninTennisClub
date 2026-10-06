import { NextResponse } from "next/server";
import { db } from "@/db";
import { apiSession, logAction } from "@/lib/auth";
import { bad, parse } from "@/lib/api";
import { partnerSchema, toRow } from "./schema";

// Ajout d'un partenaire (gérant / administrateur)
export async function POST(req: Request) {
  const { session, error } = await apiSession("partners.manage");
  if (error) return error;
  const { data, error: e2 } = await parse(req, partnerSchema);
  if (e2) return e2;
  const row = toRow(data);
  if (row.endDate < row.startDate) return bad("La fin du contrat doit être après le début");
  const p = db.partners.insert(row);
  await logAction(session, "Partenaire ajouté", data.name);
  return NextResponse.json({ message: "Partenaire ajouté", id: p.id }, { status: 201 });
}
