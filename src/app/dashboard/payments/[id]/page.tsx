import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { db } from "@/db";
import { requireSession } from "@/lib/auth";
import { completeTransaction, paymentModes } from "@/lib/payments";
import { stripe } from "@/lib/stripe";
import { dateFr, timeFr, xof } from "@/lib/format";
import { PageHeader } from "@/components/ui";
import { SummaryRow } from "../../_member/ui";
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
  let tx = db.transactions.get(id);
  if (!tx || tx.userId !== s.userId) notFound();

  // Retour de Stripe Checkout : on vérifie la session auprès de Stripe
  if (session_id && tx.status === "PENDING") {
    const st = stripe();
    if (st) {
      const cs = await st.checkout.sessions.retrieve(session_id);
      if (cs.payment_status === "paid" && cs.metadata?.transactionId === tx.id) {
        await completeTransaction(tx.id, "STRIPE", cs.id);
        tx = db.transactions.get(id)!;
      }
    }
  }
  const user = db.users.get(tx.userId);

  let details: { k: string; v: string }[] = [];
  if (tx.type === "RESERVATION") {
    const r = db.reservations.get(tx.relatedId);
    const court = r ? db.courts.get(r.courtId) : undefined;
    const coach = r?.coachId ? db.coaches.get(r.coachId) : undefined;
    if (r && court) details = [
      { k: "Court", v: `${court.name} · ${court.surface}` },
      { k: "Date", v: dateFr(r.startTime, { weekday: "long", day: "numeric", month: "long" }) },
      { k: "Horaire", v: `${timeFr(r.startTime)} – ${timeFr(r.endTime)}` },
      ...(coach ? [{ k: "Coach", v: `${coach.firstName} ${coach.lastName}` }] : []),
    ];
  }
  const [backHref, backLabel] = BACK[tx.type] ?? ["/dashboard", "Retour"];
  const modes = paymentModes();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Paiement sécurisé" title="Paiement" subtitle="Réglez en quelques secondes par MTN Mobile Money ou par carte." />
      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* Récapitulatif */}
        <aside className="lg:sticky lg:top-6 lg:order-2 lg:col-span-5">
          <div className="relative overflow-hidden rounded-[2rem] bg-ink p-6 text-white shadow-xl shadow-ink/15 md:p-7">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-lime/15 blur-3xl" aria-hidden />
            <p className="relative text-[11px] font-bold uppercase tracking-[0.25em] text-lime">{TYPE_LABEL[tx.type] ?? "Récapitulatif"}</p>
            <h2 className="relative mt-2 font-display text-2xl font-black leading-tight tracking-tight text-white">{tx.description}</h2>
            <div className="relative mt-4">
              {details.map((d) => <SummaryRow key={d.k} label={d.k} value={<span className={d.k === "Date" ? "capitalize" : ""}>{d.v}</span>} />)}
              <SummaryRow label="Référence" value={<span className="font-mono text-xs">{tx.id.slice(0, 8).toUpperCase()}</span>} />
            </div>
            <div className="relative mt-5 flex items-end justify-between gap-3">
              <span className="text-sm text-white/60">Montant</span>
              <span className="tabular font-display text-3xl font-black text-lime">{xof(tx.amount)}</span>
            </div>
          </div>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted"><ShieldCheck size={14} className="text-brand" /> Aucune donnée bancaire stockée par le club</p>
        </aside>

        <div className="min-w-0 lg:order-1 lg:col-span-7">
          {tx.status === "COMPLETED" ? (
            <div className="card p-8 text-center md:p-10">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-lime text-ink"><CheckCircle2 size={34} /></span>
              <h2 className="mt-5 font-display text-3xl font-black tracking-tight text-ink">Paiement confirmé</h2>
              <p className="mx-auto mt-2 max-w-md text-muted">
                {xof(tx.amount)} payés par {tx.method === "MTN_MONEY" ? "MTN Mobile Money" : "carte bancaire"}. Un e-mail de confirmation vous a été envoyé.
              </p>
              <Link href={backHref} className="btn-primary mt-7">{backLabel}</Link>
            </div>
          ) : tx.status === "PENDING" ? (
            <PayPanel id={tx.id} amount={tx.amount} phone={user?.phone ?? "+229 "} stripeLive={modes.stripeLive} mtnLive={modes.mtnLive} />
          ) : (
            <div className="card p-8 text-center md:p-10">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600"><XCircle size={34} /></span>
              <h2 className="mt-5 font-display text-3xl font-black tracking-tight text-ink">Paiement {tx.status === "REFUNDED" ? "remboursé" : "annulé"}</h2>
              <Link href={backHref} className="btn-ghost mt-7">{backLabel}</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
