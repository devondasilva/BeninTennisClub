// Jointures courantes entre collections (l'équivalent des « with: { … } » d'un ORM)
import { db } from "./index";
import type { Coach, Court, Event, OrderItem, Product, Reservation, User, Order, EventRegistration, Donation, Campaign, Transaction } from "./types";

/** Tri : sortBy(liste, "createdAt", "desc") — fonctionne avec dates, nombres et textes */
export function sortBy<T>(list: T[], key: keyof T, dir: "asc" | "desc" = "asc"): T[] {
  const f = dir === "asc" ? 1 : -1;
  return [...list].sort((a, b) => {
    const x = a[key] as unknown, y = b[key] as unknown;
    const vx = x instanceof Date ? x.getTime() : (x as number | string | null);
    const vy = y instanceof Date ? y.getTime() : (y as number | string | null);
    if (vx == null && vy == null) return 0;
    if (vx == null) return 1;
    if (vy == null) return -1;
    return vx < vy ? -f : vx > vy ? f : 0;
  });
}

/** Dictionnaire id → ligne, pour joindre rapidement une liste */
export function indexById<T extends { id: string }>(rows: T[]): Map<string, T> {
  return new Map(rows.map((r) => [r.id, r]));
}

export type ReservationFull = Reservation & { court: Court; coach: Coach | null; user: User };
export function withReservationRefs(list: Reservation[]): ReservationFull[] {
  const courts = indexById(db.courts.all()), coaches = indexById(db.coaches.all()), users = indexById(db.users.all());
  return list
    .filter((r) => courts.has(r.courtId) && users.has(r.userId))
    .map((r) => ({ ...r, court: courts.get(r.courtId)!, coach: r.coachId ? coaches.get(r.coachId) ?? null : null, user: users.get(r.userId)! }));
}

export type OrderFull = Order & { user: User | null; items: (OrderItem & { product: Product })[] };
export function withOrderRefs(list: Order[]): OrderFull[] {
  const products = indexById(db.products.all()), users = indexById(db.users.all());
  const items = db.orderItems.all();
  return list.map((o) => ({
    ...o,
    user: users.get(o.userId) ?? null,
    items: items.filter((i) => i.orderId === o.id && products.has(i.productId)).map((i) => ({ ...i, product: products.get(i.productId)! })),
  }));
}

export type RegistrationFull = EventRegistration & { event: Event; user: User | null };
export function withRegistrationRefs(list: EventRegistration[]): RegistrationFull[] {
  const events = indexById(db.events.all()), users = indexById(db.users.all());
  return list.filter((r) => events.has(r.eventId)).map((r) => ({ ...r, event: events.get(r.eventId)!, user: users.get(r.userId) ?? null }));
}

export type EventWithRegs = Event & { registrations: EventRegistration[] };
export function withEventRegistrations(list: Event[]): EventWithRegs[] {
  const regs = db.eventRegistrations.all();
  return list.map((e) => ({ ...e, registrations: regs.filter((r) => r.eventId === e.id) }));
}

export type DonationFull = Donation & { campaign: Campaign; user: User | null };
export function withDonationRefs(list: Donation[]): DonationFull[] {
  const campaigns = indexById(db.campaigns.all()), users = indexById(db.users.all());
  return list.filter((d) => campaigns.has(d.campaignId)).map((d) => ({ ...d, campaign: campaigns.get(d.campaignId)!, user: users.get(d.userId) ?? null }));
}

export type TransactionFull = Transaction & { user: User | null };
export function withTransactionUser(list: Transaction[]): TransactionFull[] {
  const users = indexById(db.users.all());
  return list.map((t) => ({ ...t, user: users.get(t.userId) ?? null }));
}

/** Début de journée / de mois (heure du club) */
export const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const startOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1);

/**
 * Suppression d'un membre avec ses données liées (équivalent des suppressions « en cascade »).
 * Les coachs liés au compte sont détachés, pas supprimés.
 */
export function deleteUserCascade(userId: string) {
  const resIds = new Set(db.reservations.filter((r) => r.userId === userId).map((r) => r.id));
  db.commissions.updateWhere((c) => !!c.reservationId && resIds.has(c.reservationId), { reservationId: null });
  db.reservations.removeWhere((r) => r.userId === userId);
  const orderIds = new Set(db.orders.filter((o) => o.userId === userId).map((o) => o.id));
  db.orderItems.removeWhere((i) => orderIds.has(i.orderId));
  db.orders.removeWhere((o) => o.userId === userId);
  db.eventRegistrations.removeWhere((r) => r.userId === userId);
  db.transactions.removeWhere((t) => t.userId === userId);
  db.notifications.removeWhere((n) => n.userId === userId);
  db.stringingRequests.removeWhere((s) => s.userId === userId);
  db.donations.removeWhere((d) => d.userId === userId);
  db.coachReviews.removeWhere((r) => r.userId === userId);
  db.coaches.updateWhere((c) => c.userId === userId, { userId: null });
  db.users.remove(userId);
}
