import { NextResponse } from "next/server";
import { completeTransaction } from "@/lib/payments";
import { appUrl, stripe } from "@/lib/stripe";
import { loadOwnTx } from "../../load";

// Démarre un paiement par carte.
// Avec STRIPE_SECRET_KEY : session Stripe Checkout (redirection). Sans clé : paiement simulé (démo).
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { tx, error } = await loadOwnTx(id);
  if (error) return error;

  const s = stripe();
  if (!s) {
    await completeTransaction(tx.id, "STRIPE", `DEMO-CARD-${Date.now()}`);
    return NextResponse.json({ status: "COMPLETED", demo: true });
  }
  const session = await s.checkout.sessions.create({
    mode: "payment",
    line_items: [{ quantity: 1, price_data: { currency: "xof", unit_amount: Math.round(tx.amount), product_data: { name: tx.description } } }],
    metadata: { transactionId: tx.id },
    success_url: `${appUrl()}/dashboard/payments/${tx.id}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl()}/dashboard/payments/${tx.id}`,
  });
  return NextResponse.json({ status: "REDIRECT", url: session.url });
}
