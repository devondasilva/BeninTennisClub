// Base de données du Bénin Tennis Club
// ─────────────────────────────────────────────────────────────────────────────
// Un fichier JSON par collection dans data/ : data/users.json, data/reservations.json…
// Aucun serveur ni logiciel à installer. Le dossier data/ est livré rempli avec les
// données de démonstration ; « npm run reset » les régénère.
//
//   import { db } from "@/db";
//   const user = db.users.find((u) => u.email === email);
//   db.reservations.insert({ courtId, userId, ... });
//   db.users.update(id, { firstName: "Awa" });
// ─────────────────────────────────────────────────────────────────────────────
import { Collection } from "./store";
import type * as T from "./types";

export * from "./types";
export { DATA_DIR } from "./store";

const now = () => new Date();

function createDb() {
  return {
    users: new Collection<T.User, "phone" | "role" | "avatar" | "address" | "level" | "playingHand" | "bio" | "emailNotifications" | "permissions" | "status" | "createdAt">(
      "users",
      {
        dates: ["createdAt"],
        defaults: () => ({ phone: null, role: "CLIENT", avatar: null, address: null, level: null, playingHand: null, bio: null, emailNotifications: true, permissions: "", status: "ACTIVE", createdAt: now() }),
      }
    ),
    courts: new Collection<T.Court, "description" | "image" | "isActive">("courts", {
      defaults: () => ({ description: null, image: null, isActive: true }),
    }),
    reservations: new Collection<T.Reservation, "coachId" | "status" | "createdAt">("reservations", {
      dates: ["startTime", "endTime", "createdAt"],
      defaults: () => ({ coachId: null, status: "PENDING_PAYMENT", createdAt: now() }),
    }),
    coaches: new Collection<T.Coach, "userId" | "specialization" | "bio" | "photo" | "diplomas" | "languages" | "achievements" | "availability" | "status" | "createdAt">(
      "coaches",
      {
        dates: ["createdAt"],
        defaults: () => ({ userId: null, specialization: null, bio: null, photo: null, diplomas: null, languages: null, achievements: null, availability: null, status: "ACTIVE", createdAt: now() }),
      }
    ),
    coachReviews: new Collection<T.CoachReview, "createdAt">("coach-reviews", {
      dates: ["createdAt"],
      defaults: () => ({ createdAt: now() }),
    }),
    contactMessages: new Collection<T.ContactMessage, "phone" | "status" | "createdAt">("contact-messages", {
      dates: ["createdAt"],
      defaults: () => ({ phone: null, status: "NEW", createdAt: now() }),
    }),
    commissions: new Collection<T.Commission, "reservationId" | "status" | "paymentMethod" | "paidAt" | "createdAt">("commissions", {
      dates: ["sessionDate", "paidAt", "createdAt"],
      defaults: () => ({ reservationId: null, status: "PENDING", paymentMethod: null, paidAt: null, createdAt: now() }),
    }),
    events: new Collection<T.Event, "price" | "image" | "status">("events", {
      dates: ["startDate", "endDate"],
      defaults: () => ({ price: 0, image: null, status: "ACTIVE" }),
    }),
    eventRegistrations: new Collection<T.EventRegistration, "status" | "createdAt">("event-registrations", {
      dates: ["createdAt"],
      defaults: () => ({ status: "PENDING_PAYMENT", createdAt: now() }),
    }),
    products: new Collection<T.Product, "image" | "rating" | "reviews" | "isActive">("products", {
      defaults: () => ({ image: null, rating: 0, reviews: 0, isActive: true }),
    }),
    orders: new Collection<T.Order, "status" | "createdAt">("orders", {
      dates: ["createdAt"],
      defaults: () => ({ status: "PENDING_PAYMENT", createdAt: now() }),
    }),
    orderItems: new Collection<T.OrderItem>("order-items"),
    transactions: new Collection<T.Transaction, "currency" | "status" | "method" | "reference" | "createdAt" | "paidAt">("transactions", {
      dates: ["createdAt", "paidAt"],
      defaults: () => ({ currency: "XOF", status: "PENDING", method: null, reference: null, createdAt: now(), paidAt: null }),
    }),
    notifications: new Collection<T.Notification, "link" | "read" | "createdAt">("notifications", {
      dates: ["createdAt"],
      defaults: () => ({ link: null, read: false, createdAt: now() }),
    }),
    stringingRequests: new Collection<T.StringingRequest, "notes" | "urgent" | "status" | "createdAt">("stringing-requests", {
      dates: ["preferredDate", "createdAt"],
      defaults: () => ({ notes: null, urgent: false, status: "PENDING_PAYMENT", createdAt: now() }),
    }),
    campaigns: new Collection<T.Campaign, "image" | "status" | "createdAt">("campaigns", {
      dates: ["deadline", "createdAt"],
      defaults: () => ({ image: null, status: "ACTIVE", createdAt: now() }),
    }),
    donations: new Collection<T.Donation, "donorName" | "message" | "anonymous" | "status" | "createdAt">("donations", {
      dates: ["createdAt"],
      defaults: () => ({ donorName: null, message: null, anonymous: false, status: "PENDING", createdAt: now() }),
    }),
    partners: new Collection<
      T.Partner,
      "logo" | "website" | "status" | "tagline" | "banner" | "placements" | "impressions" | "clicks" | "contactName" | "contactEmail" | "contactPhone"
    >("partners", {
      dates: ["startDate", "endDate"],
      defaults: () => ({
        logo: null, website: null, status: "ACTIVE", tagline: null, banner: null,
        placements: "HOME,EVENTS,COACHES,DASHBOARD,SHOP", impressions: 0, clicks: 0,
        contactName: null, contactEmail: null, contactPhone: null,
      }),
    }),
    settings: new Collection<T.Setting>("settings"),
    adminLogs: new Collection<T.AdminLog, "userId" | "target" | "createdAt">("admin-logs", {
      dates: ["createdAt"],
      defaults: () => ({ userId: null, target: null, createdAt: now() }),
    }),
  };
}

export type Db = ReturnType<typeof createDb>;

// Une seule instance par processus (survit aux rechargements à chaud en développement)
const g = globalThis as unknown as { __btcDb?: Db };
export const db: Db = (g.__btcDb ??= createDb());

/** Collections et fichiers correspondants (contrôle de santé, sauvegardes) */
export function dbInfo() {
  const counts: Record<string, number> = {};
  for (const [key, col] of Object.entries(db)) counts[key] = (col as Collection<{ id: string }>).count();
  return { counts };
}
