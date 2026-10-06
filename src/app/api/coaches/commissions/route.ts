import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db, t } from "@/db";
import { apiSession, logAction } from "@/lib/auth";
import { parse } from "@/lib/api";

const schema = z.object({ ids: z.array(z.string()).min(1, "Sélectionnez au moins une commission"), paymentMethod: z.enum(["TRANSFER", "MTN_MONEY", "CASH"]) });

// Marque des commissions « terminées » comme payées
export async function POST(req: Request) {
  const { session, error } = await apiSession("commissions.manage");
  if (error) return error;
  const { data, error: e2 } = await parse(req, schema);
  if (e2) return e2;
  const updated = await db.update(t.commissions)
    .set({ status: "PAID", paidAt: new Date(), paymentMethod: data.paymentMethod })
    .where(and(inArray(t.commissions.id, data.ids), eq(t.commissions.status, "COMPLETED")))
    .returning();
  await logAction(session, "Commissions réglées", `${updated.length} commission(s)`);
  return NextResponse.json({ message: `${updated.length} commission(s) payée(s)` });
}
