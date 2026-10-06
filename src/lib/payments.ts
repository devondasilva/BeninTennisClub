import { and, eq, sql } from "drizzle-orm";
import { db, t } from "@/db";
import { notify } from "./notify";
import { xof, dateFr, timeFr } from "./format";

export type PaymentType = "RESERVATION" | "EVENT" | "SHOP" | "STRINGING" | "DONATION";

export async function createTransaction(
  userId: string,
  type: PaymentType,
  relatedId: string,
  amount: number,
  description: string
) {
  const [tx] = await db
    .insert(t.transactions)
    .values({ userId, type, relatedId, amount, description, status: "PENDING" })
    .returning();
  return tx;
}

/**
 * Finalise un paiement : marque la transaction payée, met à jour l'objet lié
 * (réservation, commande, don...) puis envoie notification + e-mail.
 * Idempotent : un second appel ne refait rien.
 */
export async function completeTransaction(id: string, method: string, reference?: string) {
  const [tx] = await db
    .update(t.transactions)
    .set({ status: "COMPLETED", method, reference, paidAt: new Date() })
    .where(and(eq(t.transactions.id, id), eq(t.transactions.status, "PENDING")))
    .returning();
  if (!tx) return db.query.transactions.findFirst({ where: eq(t.transactions.id, id) });

  switch (tx.type) {
    case "RESERVATION": {
      await db.update(t.reservations).set({ status: "CONFIRMED" }).where(eq(t.reservations.id, tx.relatedId));
      const r = await db.query.reservations.findFirst({
        where: eq(t.reservations.id, tx.relatedId),
        with: { court: true, coach: true, user: true },
      });
      if (!r) break;
      if (r.coach) {
        await db.insert(t.commissions).values({
          coachId: r.coach.id,
          reservationId: r.id,
          clientName: `${r.user.firstName} ${r.user.lastName}`,
          sessionDate: r.startTime,
          baseAmount: r.price,
          rate: r.coach.commissionRate,
          amount: Math.round((r.price * r.coach.commissionRate) / 100),
        });
      }
      await notify(
        tx.userId,
        "RESERVATION_CONFIRMED",
        "Réservation confirmée",
        `${r.court.name} le ${dateFr(r.startTime)} de ${timeFr(r.startTime)} à ${timeFr(r.endTime)}.`,
        "/dashboard/reservations",
        `<p>Votre réservation est confirmée :</p><ul><li><b>Terrain :</b> ${r.court.name}</li>
         <li><b>Date :</b> ${dateFr(r.startTime)}</li><li><b>Horaire :</b> ${timeFr(r.startTime)} – ${timeFr(r.endTime)}</li>
         ${r.coach ? `<li><b>Coach :</b> ${r.coach.firstName} ${r.coach.lastName}</li>` : ""}
         <li><b>Montant :</b> ${xof(r.price)}</li><li><b>N° :</b> ${r.id.slice(0, 8).toUpperCase()}</li></ul>`
      );
      break;
    }
    case "EVENT": {
      await db.update(t.eventRegistrations).set({ status: "CONFIRMED" }).where(eq(t.eventRegistrations.id, tx.relatedId));
      const reg = await db.query.eventRegistrations.findFirst({
        where: eq(t.eventRegistrations.id, tx.relatedId),
        with: { event: true },
      });
      if (reg)
        await notify(tx.userId, "EVENT_REGISTERED", "Inscription confirmée",
          `Vous êtes inscrit(e) à « ${reg.event.title} » le ${dateFr(reg.event.startDate)}.`, "/dashboard/events");
      break;
    }
    case "SHOP": {
      await db.update(t.orders).set({ status: "PAID" }).where(eq(t.orders.id, tx.relatedId));
      const order = await db.query.orders.findFirst({
        where: eq(t.orders.id, tx.relatedId),
        with: { items: { with: { product: true } } },
      });
      if (!order) break;
      const rows = order.items
        .map((i) => `<tr><td>${i.product.name}</td><td>× ${i.quantity}</td><td align="right">${xof(i.price * i.quantity)}</td></tr>`)
        .join("");
      await notify(tx.userId, "ORDER_CONFIRMED", "Commande confirmée",
        `Votre commande de ${xof(order.totalAmount)} est payée. Livraison estimée sous 3 à 5 jours.`,
        "/dashboard/shop/orders",
        `<p>Merci pour votre commande !</p><table width="100%">${rows}</table>
         <p><b>Total : ${xof(order.totalAmount)}</b><br/>Livraison : ${order.shippingAddress}</p>`);
      break;
    }
    case "STRINGING": {
      await db.update(t.stringingRequests).set({ status: "PENDING" }).where(eq(t.stringingRequests.id, tx.relatedId));
      await notify(tx.userId, "PAYMENT_CONFIRMED", "Demande de cordage enregistrée",
        `Paiement de ${xof(tx.amount)} reçu. Nous vous prévenons dès que votre raquette est prête.`, "/dashboard/stringing");
      break;
    }
    case "DONATION": {
      await db.update(t.donations).set({ status: "COMPLETED" }).where(eq(t.donations.id, tx.relatedId));
      const d = await db.query.donations.findFirst({ where: eq(t.donations.id, tx.relatedId), with: { campaign: true } });
      if (!d) break;
      const [{ total }] = await db
        .select({ total: sql<number>`coalesce(sum(${t.donations.amount}), 0)` })
        .from(t.donations)
        .where(and(eq(t.donations.campaignId, d.campaignId), eq(t.donations.status, "COMPLETED")));
      if (total >= d.campaign.targetAmount) {
        await db.update(t.campaigns).set({ status: "COMPLETED" }).where(eq(t.campaigns.id, d.campaignId));
      }
      await notify(tx.userId, "PAYMENT_CONFIRMED", "Merci pour votre don !",
        `Votre don de ${xof(d.amount)} pour « ${d.campaign.title} » a bien été reçu.`, `/dashboard/fundraising/${d.campaignId}`);
      break;
    }
  }
  return tx;
}

export function paymentModes() {
  return {
    stripeLive: !!process.env.STRIPE_SECRET_KEY,
    mtnLive: !!(process.env.MTN_MOMO_SUBSCRIPTION_KEY && process.env.MTN_MOMO_API_USER && process.env.MTN_MOMO_API_KEY),
  };
}
