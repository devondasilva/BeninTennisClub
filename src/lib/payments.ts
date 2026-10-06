import { db } from "@/db";
import { withOrderRefs } from "@/db/relations";
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
  return db.transactions.insert({ userId, type, relatedId, amount, description, status: "PENDING" });
}

/**
 * Finalise un paiement : marque la transaction payée, met à jour l'objet lié
 * (réservation, commande, don...) puis envoie notification + e-mail.
 * Idempotent : un second appel ne refait rien.
 */
export async function completeTransaction(id: string, method: string, reference?: string) {
  const current = db.transactions.get(id);
  if (!current || current.status !== "PENDING") return current;
  const tx = db.transactions.update(id, { status: "COMPLETED", method, reference: reference ?? null, paidAt: new Date() })!;

  switch (tx.type) {
    case "RESERVATION": {
      const res = db.reservations.update(tx.relatedId, { status: "CONFIRMED" });
      const court = res && db.courts.get(res.courtId);
      const user = res && db.users.get(res.userId);
      if (!res || !court || !user) break;
      const r = { ...res, court, user, coach: res.coachId ? db.coaches.get(res.coachId) ?? null : null };
      if (r.coach) {
        db.commissions.insert({
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
      const registration = db.eventRegistrations.update(tx.relatedId, { status: "CONFIRMED" });
      const event = registration && db.events.get(registration.eventId);
      const reg = registration && event ? { ...registration, event } : null;
      if (reg)
        await notify(tx.userId, "EVENT_REGISTERED", "Inscription confirmée",
          `Vous êtes inscrit(e) à « ${reg.event.title} » le ${dateFr(reg.event.startDate)}.`, "/dashboard/events");
      break;
    }
    case "SHOP": {
      const paid = db.orders.update(tx.relatedId, { status: "PAID" });
      if (!paid) break;
      const [order] = withOrderRefs([paid]);
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
      db.stringingRequests.update(tx.relatedId, { status: "PENDING" });
      await notify(tx.userId, "PAYMENT_CONFIRMED", "Demande de cordage enregistrée",
        `Paiement de ${xof(tx.amount)} reçu. Nous vous prévenons dès que votre raquette est prête.`, "/dashboard/stringing");
      break;
    }
    case "DONATION": {
      const donation = db.donations.update(tx.relatedId, { status: "COMPLETED" });
      const campaign = donation && db.campaigns.get(donation.campaignId);
      if (!donation || !campaign) break;
      const d = { ...donation, campaign };
      const total = db.donations.sum("amount", (x) => x.campaignId === d.campaignId && x.status === "COMPLETED");
      if (total >= d.campaign.targetAmount) db.campaigns.update(d.campaignId, { status: "COMPLETED" });
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
