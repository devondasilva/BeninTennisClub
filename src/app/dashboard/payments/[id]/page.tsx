import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { CheckCircle2, XCircle } from "lucide-react";
import { db, t } from "@/db";
import { requireSession } from "@/lib/auth";
import { completeTransaction, paymentModes } from "@/lib/payments";
import { stripe } from "@/lib/stripe";
import { dateFr, timeFr, xof } from "@/lib/format";
import PayPanel from "./PayPanel";

export const metadata = { title: "Paiement" };

const BACK: Record<string, [string, string]> = {
  RESERVATION: ["/dashboard/reservations", "Voir mes réservations"],
  EVENT: ["/dashboard/events", "Voir les événements"],
  SHOP: ["/dashboard/shop/orders", "Suivre ma commande"],
  STRINGING: ["/dashboard/stringing", "Suivre mon cordage"],
  DONATION: ["/dashboard/fundraising", "Retour aux collectes"],
};
const TYPE_LABEL: Record<string, string> = {
  RESERVATION: "Réservation de court", EVENT: "Inscription à un événement", SHOP: "Commande boutique", STRINGING: "Cordage de raquette", DONATION: "Don",
};

export default async function PaymentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ session_id?: string }> }) {
  const s = await requireSession();
  const { id } = await params;
  const { session_id } = await searchParams;
  let tx = await db.query.transactions.findFirst({ where: eq(t.transactions.id, id), with: { user: true } });
  if (!tx || tx.userId !== s.userId) notFound();

  // Retour de Stripe Checkout : on vérifie la session auprès de Stripe
  if (session_id && tx.status === "PENDING") {
    const st = stripe();
    if (st) {
      const cs = await st.checkout.sessions.retrieve(session_id);
      if (cs.payment_status === "paid" && cs.metadata?.transactionId === tx.id) {
        await completeTransaction(tx.id, "STRIPE", cs.id);
        tx = (await db.query.transactions.findFirst({ where: eq(t.transactions.id, id), with: { user: true } }))!;
      }
    }
  }

  let details: { k: string; v: string }[] = [];
  if (tx.type === "RESERVATION") {
    const r = await db.query.reservations.findFirst({ where: eq(t.reservations.id, tx.relatedId), with: { court: true, coach: true } });
    if (r) details = [
      { k: "Court", v: `${r.court.name} · ${r.court.surface}` },
      { k: "Date", v: dateFr(r.startTime, { weekday: "long", day: "numeric", month: "long" }) },
      { k: "Horaire", v: `${timeFr(r.startTime)} – ${timeFr(r.endTime)}` },
      ...(r.coach ? [{ k: "Coach", v: `${r.coach.firstName} ${r.coach.lastName}` }] : []),
    ];
  }
  const [backHref, backLabel] = BACK[tx.type] ?? ["/dashboard", "Retour"];
  const modes = paymentModes();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="card p-6">
            <p className="text-sm text-slate-500">{TYPE_LABEL[tx.type]}</p>
            <h1 className="mt-1 text-xl font-bold text-primary-400">{tx.description}</h1>
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
              {details.map((d) => (
                <div key={d.k} className="flex justify-between gap-3"><span className="text-slate-500">{d.k}</span><span className="text-right font-medium">{d.v}</span></div>
              ))}
              <div className="flex justify-between gap-3"><span className="text-slate-500">Référence</span><span className="font-mono text-xs">{tx.id.slice(0, 8).toUpperCase()}</span></div>
            </div>
            <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
              <span className="font-semibold">Montant</span>
              <span className="text-3xl font-bold text-primary-400">{xof(tx.amount)}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          {tx.status === "COMPLETED" ? (
            <div className="card p-8 text-center">
              <CheckCircle2 className="mx-auto text-emerald-500" size={64} />
              <h2 className="mt-4 text-2xl font-bold text-primary-400">Paiement confirmé</h2>
              <p className="mt-2 text-slate-500">
                {xof(tx.amount)} payés par {tx.method === "MTN_MONEY" ? "MTN Mobile Money" : "carte bancaire"}. Un e-mail de confirmation vous a été envoyé.
              </p>
              <Link href={backHref} className="btn-primary mt-6">{backLabel}</Link>
            </div>
          ) : tx.status === "PENDING" ? (
            <PayPanel id={tx.id} amount={tx.amount} phone={tx.user.phone ?? "+229 "} stripeLive={modes.stripeLive} mtnLive={modes.mtnLive} />
          ) : (
            <div className="card p-8 text-center">
              <XCircle className="mx-auto text-red-500" size={64} />
              <h2 className="mt-4 text-2xl font-bold text-primary-400">Paiement {tx.status === "REFUNDED" ? "remboursé" : "annulé"}</h2>
              <Link href={backHref} className="btn-ghost mt-6">{backLabel}</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
