import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { apiSession } from "@/lib/auth";
import { bad, parse } from "@/lib/api";
import { completeTransaction, paymentModes } from "@/lib/payments";
import { paymentStatus, requestToPay } from "@/lib/mtn";
import { loadOwnTx } from "../../load";

const schema = z.object({ phone: z.string().regex(/^\+?229\s?\d{2}(\s?\d{2}){3}$|^\+?\d{8,15}$/, "Numéro MTN invalide (ex. +229 96 12 34 56)") });

// 1) POST : envoie la demande de paiement sur le téléphone du client
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { tx, error } = await loadOwnTx(id);
  if (error) return error;
  const { data, error: e2 } = await parse(req, schema);
  if (e2) return e2;

  let reference: string;
  if (paymentModes().mtnLive) {
    try {
      reference = await requestToPay(tx.amount, data.phone, tx.id, tx.description.slice(0, 80));
    } catch (e) {
      console.error(e);
      return bad("MTN Mobile Money est indisponible pour le moment, réessayez.", 502);
    }
  } else {
    reference = `DEMO-MTN-${Date.now()}`;
  }
  db.transactions.update(tx.id, { method: "MTN_MONEY", reference });
  return NextResponse.json({ status: "PENDING", reference });
}

// 2) GET : le navigateur interroge le statut jusqu'à validation sur le téléphone
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await apiSession();
  if (error) return error;
  const { id } = await params;
  const tx = db.transactions.get(id);
  if (!tx || tx.userId !== session.userId) return bad("Paiement introuvable", 404);
  if (tx.status !== "PENDING") return NextResponse.json({ status: tx.status });
  if (!tx.reference) return NextResponse.json({ status: "PENDING" });

  let status: "PENDING" | "SUCCESSFUL" | "FAILED";
  if (tx.reference.startsWith("DEMO-MTN-")) {
    // Démo : le client « valide » sur son téléphone 4 secondes après la demande
    status = Date.now() - Number(tx.reference.slice(9)) > 4000 ? "SUCCESSFUL" : "PENDING";
  } else {
    status = await paymentStatus(tx.reference);
  }
  if (status === "SUCCESSFUL") {
    await completeTransaction(tx.id, "MTN_MONEY", tx.reference);
    return NextResponse.json({ status: "COMPLETED" });
  }
  if (status === "FAILED") {
    db.transactions.update(tx.id, { status: "FAILED" });
    return NextResponse.json({ status: "FAILED" });
  }
  return NextResponse.json({ status: "PENDING" });
}
