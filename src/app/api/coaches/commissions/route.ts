import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { apiSession, logAction } from "@/lib/auth";
import { parse } from "@/lib/api";

const schema = z.object({ ids: z.array(z.string()).min(1, "Sélectionnez au moins une commission"), paymentMethod: z.enum(["TRANSFER", "MTN_MONEY", "CASH"]) });

// Marque des commissions « terminées » comme payées
export async function POST(req: Request) {
  const { session, error } = await apiSession("commissions.manage");
  if (error) return error;
  const { data, error: e2 } = await parse(req, schema);
  if (e2) return e2;
  const ids = new Set(data.ids);
  const updated = db.commissions.updateWhere(
    (c) => ids.has(c.id) && c.status === "COMPLETED",
    { status: "PAID", paidAt: new Date(), paymentMethod: data.paymentMethod }
  );
  await logAction(session, "Commissions réglées", `${updated} commission(s)`);
  return NextResponse.json({ message: `${updated} commission(s) payée(s)` });
}
