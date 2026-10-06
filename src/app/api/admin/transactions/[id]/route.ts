import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db, t } from "@/db";
import { apiSession, logAction } from "@/lib/auth";
import { bad, parse } from "@/lib/api";
import { completeTransaction } from "@/lib/payments";
import { notify } from "@/lib/notify";
import { xof } from "@/lib/format";

const schema = z.object({ action: z.enum(["cash", "refund"]) });

// Encaisser un paiement en espèces à l'accueil, ou rembourser un paiement
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await apiSession("payments.manage");
  if (error) return error;
  const { id } = await params;
  const { data, error: e2 } = await parse(req, schema);
  if (e2) return e2;
  const tx = await db.query.transactions.findFirst({ where: eq(t.transactions.id, id), with: { user: true } });
  if (!tx) return bad("Paiement introuvable", 404);
  if (data.action === "cash") {
    if (tx.status !== "PENDING") return bad("Ce paiement n'est pas en attente");
    await completeTransaction(id, "CASH", `ESPECES-${session.firstName.toUpperCase()}`);
    await logAction(session, "Paiement encaissé en espèces", `${tx.description} — ${xof(tx.amount)} (${tx.user.firstName} ${tx.user.lastName})`);
    return NextResponse.json({ message: "Paiement encaissé" });
  }
  if (tx.status !== "COMPLETED") return bad("Seul un paiement réglé peut être remboursé");
  await db.update(t.transactions).set({ status: "REFUNDED" }).where(eq(t.transactions.id, id));
  await notify(tx.userId, "PAYMENT_CONFIRMED", "Remboursement effectué", `${xof(tx.amount)} vous sont remboursés pour « ${tx.description} ».`, "/dashboard/payments");
  await logAction(session, "Paiement remboursé", `${tx.description} — ${xof(tx.amount)} (${tx.user.firstName} ${tx.user.lastName})`);
  return NextResponse.json({ message: "Remboursement enregistré" });
}
