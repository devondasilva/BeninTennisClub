import { NextResponse } from "next/server";
import { completeTransaction } from "@/lib/payments";
import { stripe } from "@/lib/stripe";

// Webhook Stripe (facultatif mais recommandé en production)
// stripe listen --forward-to localhost:3000/api/payments/webhook
export async function POST(req: Request) {
  const s = stripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!s || !secret) return NextResponse.json({ received: false }, { status: 400 });
  const sig = req.headers.get("stripe-signature") ?? "";
  try {
    const event = s.webhooks.constructEvent(await req.text(), sig, secret);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.payment_status === "paid" && session.metadata?.transactionId) {
        await completeTransaction(session.metadata.transactionId, "STRIPE", session.id);
      }
    }
    return NextResponse.json({ received: true });
  } catch (e) {
    return NextResponse.json({ message: (e as Error).message }, { status: 400 });
  }
}
