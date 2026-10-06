// Bénin Tennis Club — schéma de base de données (Drizzle ORM + SQLite/libSQL)
import { sqliteTable, text, integer, real, uniqueIndex, index } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

const id = () => text("id").primaryKey().$defaultFn(() => randomUUID());
const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`);
const ts = (name: string) => integer(name, { mode: "timestamp_ms" });

// ============ UTILISATEURS ============
// role : ADMIN | MANAGER | COACH | PARENT | CLIENT | STAFF | SPONSOR
export const users = sqliteTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("CLIENT"),
  avatar: text("avatar"), // chemin d'un avatar prédéfini ou photo envoyée (data URL JPEG redimensionnée)
  address: text("address"),
  level: text("level"), // DEBUTANT | INTERMEDIAIRE | CONFIRME | COMPETITION
  playingHand: text("playing_hand"), // RIGHT | LEFT
  bio: text("bio"),
  emailNotifications: integer("email_notifications", { mode: "boolean" }).notNull().default(true),
  permissions: text("permissions").notNull().default(""), // accès supplémentaires accordés par l'admin (liste séparée par des virgules)
  status: text("status").notNull().default("ACTIVE"), // ACTIVE | SUSPENDED
  createdAt: createdAt(),
});

// ============ TERRAINS & RÉSERVATIONS ============
export const courts = sqliteTable("courts", {
  id: id(),
  name: text("name").notNull(),
  surface: text("surface").notNull(),
  description: text("description"),
  image: text("image"),
  pricePerSlot: real("price_per_slot").notNull(), // prix par créneau de 30 min (XOF)
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

// status : PENDING_PAYMENT | CONFIRMED | CANCELLED
export const reservations = sqliteTable(
  "reservations",
  {
    id: id(),
    courtId: text("court_id").notNull().references(() => courts.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    coachId: text("coach_id").references(() => coaches.id),
    startTime: ts("start_time").notNull(),
    endTime: ts("end_time").notNull(),
    price: real("price").notNull(),
    status: text("status").notNull().default("PENDING_PAYMENT"),
    createdAt: createdAt(),
  },
  (t) => [index("res_court_start").on(t.courtId, t.startTime)]
);

// ============ COACHS & COMMISSIONS ============
export const coaches = sqliteTable("coaches", {
  id: id(),
  userId: text("user_id").unique().references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  specialization: text("specialization"),
  experience: integer("experience").notNull(),
  hourlyRate: real("hourly_rate").notNull(),
  commissionRate: real("commission_rate").notNull(), // % reversé au coach
  bio: text("bio"),
  photo: text("photo"),
  diplomas: text("diplomas"), // un diplôme par ligne
  languages: text("languages"),
  achievements: text("achievements"), // un palmarès par ligne
  availability: text("availability"), // JSON : [{ day, hours }]
  status: text("status").notNull().default("ACTIVE"),
  createdAt: createdAt(),
});

// Avis des membres sur les coachs (1 avis par membre et par coach)
export const coachReviews = sqliteTable(
  "coach_reviews",
  {
    id: id(),
    coachId: text("coach_id").notNull().references(() => coaches.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment").notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("review_coach_user").on(t.coachId, t.userId)]
);

// Messages du formulaire de contact
export const contactMessages = sqliteTable("contact_messages", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("NEW"), // NEW | READ
  createdAt: createdAt(),
});

// status : PENDING | COMPLETED | PAID
export const commissions = sqliteTable("commissions", {
  id: id(),
  coachId: text("coach_id").notNull().references(() => coaches.id, { onDelete: "cascade" }),
  reservationId: text("reservation_id").unique().references(() => reservations.id, { onDelete: "set null" }),
  clientName: text("client_name").notNull(),
  sessionDate: ts("session_date").notNull(),
  baseAmount: real("base_amount").notNull(),
  rate: real("rate").notNull(),
  amount: real("amount").notNull(),
  status: text("status").notNull().default("PENDING"),
  paymentMethod: text("payment_method"),
  paidAt: ts("paid_at"),
  createdAt: createdAt(),
});

// ============ ÉVÉNEMENTS ============
// type : TOURNAMENT | STAGE | SCHOOL | GATHERING
export const events = sqliteTable("events", {
  id: id(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  startDate: ts("start_date").notNull(),
  endDate: ts("end_date").notNull(),
  location: text("location").notNull(),
  capacity: integer("capacity").notNull(),
  price: real("price").notNull().default(0),
  image: text("image"),
  status: text("status").notNull().default("ACTIVE"),
});

// status : PENDING_PAYMENT | CONFIRMED
export const eventRegistrations = sqliteTable(
  "event_registrations",
  {
    id: id(),
    eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("PENDING_PAYMENT"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("reg_event_user").on(t.eventId, t.userId)]
);

// ============ BOUTIQUE ============
// category : RACKETS | BALLS | CLOTHING | SHOES | ACCESSORIES
export const products = sqliteTable("products", {
  id: id(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  price: real("price").notNull(),
  stock: integer("stock").notNull(),
  image: text("image"),
  rating: real("rating").notNull().default(0),
  reviews: integer("reviews").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true), // false = retiré de la vente
});

// status : PENDING_PAYMENT | PAID | SHIPPED | DELIVERED | CANCELLED
export const orders = sqliteTable("orders", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("PENDING_PAYMENT"),
  totalAmount: real("total_amount").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  phone: text("phone").notNull(),
  createdAt: createdAt(),
});

export const orderItems = sqliteTable("order_items", {
  id: id(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(),
});

// ============ PAIEMENTS ============
// type : RESERVATION | EVENT | SHOP | STRINGING | DONATION
// status : PENDING | COMPLETED | FAILED | REFUNDED · method : STRIPE | MTN_MONEY
export const transactions = sqliteTable("transactions", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  relatedId: text("related_id").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("XOF"),
  status: text("status").notNull().default("PENDING"),
  method: text("method"),
  reference: text("reference"),
  description: text("description").notNull(),
  createdAt: createdAt(),
  paidAt: ts("paid_at"),
});

// ============ NOTIFICATIONS ============
export const notifications = sqliteTable("notifications", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: createdAt(),
});

// ============ CORDAGE ============
// status : PENDING_PAYMENT | PENDING | IN_PROGRESS | READY_FOR_PICKUP | COMPLETED
export const stringingRequests = sqliteTable("stringing_requests", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  racketBrand: text("racket_brand").notNull(),
  racketModel: text("racket_model").notNull(),
  stringType: text("string_type").notNull(),
  tension: integer("tension").notNull(),
  stringPattern: text("string_pattern").notNull(),
  notes: text("notes"),
  preferredDate: ts("preferred_date").notNull(),
  urgent: integer("urgent", { mode: "boolean" }).notNull().default(false),
  price: real("price").notNull(),
  status: text("status").notNull().default("PENDING_PAYMENT"),
  createdAt: createdAt(),
});

// ============ COLLECTES (CAGNOTTES) ============
// category : EQUIPMENT | FACILITY | TOURNAMENT | TRAINING | COMMUNITY | OTHER
export const campaigns = sqliteTable("campaigns", {
  id: id(),
  createdById: text("created_by_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  targetAmount: real("target_amount").notNull(),
  deadline: ts("deadline").notNull(),
  image: text("image"),
  status: text("status").notNull().default("ACTIVE"),
  createdAt: createdAt(),
});

// status : PENDING | COMPLETED
export const donations = sqliteTable("donations", {
  id: id(),
  campaignId: text("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: real("amount").notNull(),
  donorName: text("donor_name"),
  message: text("message"),
  anonymous: integer("anonymous", { mode: "boolean" }).notNull().default(false),
  status: text("status").notNull().default("PENDING"),
  createdAt: createdAt(),
});

// ============ PARTENAIRES & SPONSORS ============
// tier : PLATINUM | GOLD | SILVER | PARTNER
export const partners = sqliteTable("partners", {
  id: id(),
  name: text("name").notNull(),
  tier: text("tier").notNull(),
  description: text("description").notNull(),
  logo: text("logo"),
  website: text("website"),
  amount: real("amount").notNull(),
  startDate: ts("start_date").notNull(),
  endDate: ts("end_date").notNull(),
  status: text("status").notNull().default("ACTIVE"),
  // Espace publicitaire
  tagline: text("tagline"), // accroche affichée avec la bannière
  banner: text("banner"), // bannière 4:1 (chemin /images/... ou image envoyée)
  placements: text("placements").notNull().default("HOME,EVENTS,COACHES,DASHBOARD,SHOP"),
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
});

// ============ RELATIONS ============
export const usersRelations = relations(users, ({ many, one }) => ({
  reservations: many(reservations),
  orders: many(orders),
  notifications: many(notifications),
  coach: one(coaches, { fields: [users.id], references: [coaches.userId] }),
}));

export const courtsRelations = relations(courts, ({ many }) => ({ reservations: many(reservations) }));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  court: one(courts, { fields: [reservations.courtId], references: [courts.id] }),
  user: one(users, { fields: [reservations.userId], references: [users.id] }),
  coach: one(coaches, { fields: [reservations.coachId], references: [coaches.id] }),
}));

export const coachesRelations = relations(coaches, ({ many, one }) => ({
  reservations: many(reservations),
  commissions: many(commissions),
  reviews: many(coachReviews),
  user: one(users, { fields: [coaches.userId], references: [users.id] }),
}));

export const coachReviewsRelations = relations(coachReviews, ({ one }) => ({
  coach: one(coaches, { fields: [coachReviews.coachId], references: [coaches.id] }),
  user: one(users, { fields: [coachReviews.userId], references: [users.id] }),
}));

export const commissionsRelations = relations(commissions, ({ one }) => ({
  coach: one(coaches, { fields: [commissions.coachId], references: [coaches.id] }),
}));

export const eventsRelations = relations(events, ({ many }) => ({ registrations: many(eventRegistrations) }));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  event: one(events, { fields: [eventRegistrations.eventId], references: [events.id] }),
  user: one(users, { fields: [eventRegistrations.userId], references: [users.id] }),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  user: one(users, { fields: [orders.userId], references: [users.id] }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
}));

export const stringingRelations = relations(stringingRequests, ({ one }) => ({
  user: one(users, { fields: [stringingRequests.userId], references: [users.id] }),
}));

export const campaignsRelations = relations(campaigns, ({ many, one }) => ({
  donations: many(donations),
  creator: one(users, { fields: [campaigns.createdById], references: [users.id] }),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
  campaign: one(campaigns, { fields: [donations.campaignId], references: [campaigns.id] }),
  user: one(users, { fields: [donations.userId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type Court = typeof courts.$inferSelect;
export type Coach = typeof coaches.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;

// ============ ADMINISTRATION ============
// Réglages éditables depuis l'espace admin (coordonnées du club, adhésions...)
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(), // JSON
});

// Journal des actions d'administration
export const adminLogs = sqliteTable("admin_logs", {
  id: id(),
  userId: text("user_id"),
  userName: text("user_name").notNull(),
  action: text("action").notNull(),
  target: text("target"),
  createdAt: createdAt(),
});
