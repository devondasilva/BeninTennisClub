// Bénin Tennis Club — types des données enregistrées dans data/*.json
// Les dates sont des objets Date en mémoire et des chaînes ISO dans les fichiers.

/** ADMIN | MANAGER | COACH | PARENT | CLIENT | STAFF | SPONSOR */
export type User = {
  id: string;
  email: string;
  password: string; // « scrypt:<sel>:<empreinte> »
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  avatar: string | null; // avatar prédéfini ou photo envoyée (data URL JPEG redimensionnée)
  address: string | null;
  level: string | null; // DEBUTANT | INTERMEDIAIRE | CONFIRME | COMPETITION
  playingHand: string | null; // RIGHT | LEFT
  bio: string | null;
  emailNotifications: boolean;
  permissions: string; // accès supplémentaires accordés par l'admin (liste séparée par des virgules)
  status: string; // ACTIVE | SUSPENDED
  createdAt: Date;
};

export type Court = {
  id: string;
  name: string;
  surface: string;
  description: string | null;
  image: string | null;
  pricePerSlot: number; // prix par créneau de 30 min (XOF)
  isActive: boolean;
};

/** status : PENDING_PAYMENT | CONFIRMED | CANCELLED */
export type Reservation = {
  id: string;
  courtId: string;
  userId: string;
  coachId: string | null;
  startTime: Date;
  endTime: Date;
  price: number;
  status: string;
  createdAt: Date;
};

export type Coach = {
  id: string;
  userId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string | null;
  experience: number;
  hourlyRate: number;
  commissionRate: number; // % reversé au coach
  bio: string | null;
  photo: string | null;
  diplomas: string | null; // un diplôme par ligne
  languages: string | null;
  achievements: string | null; // un palmarès par ligne
  availability: string | null; // JSON : [{ day, hours }]
  status: string;
  createdAt: Date;
};

/** Avis des membres sur les coachs (1 avis par membre et par coach) */
export type CoachReview = {
  id: string;
  coachId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string; // NEW | READ
  createdAt: Date;
};

/** status : PENDING | COMPLETED | PAID */
export type Commission = {
  id: string;
  coachId: string;
  reservationId: string | null;
  clientName: string;
  sessionDate: Date;
  baseAmount: number;
  rate: number;
  amount: number;
  status: string;
  paymentMethod: string | null;
  paidAt: Date | null;
  createdAt: Date;
};

/** type : TOURNAMENT | STAGE | SCHOOL | GATHERING */
export type Event = {
  id: string;
  title: string;
  description: string;
  type: string;
  startDate: Date;
  endDate: Date;
  location: string;
  capacity: number;
  price: number;
  image: string | null;
  status: string;
};

/** status : PENDING_PAYMENT | CONFIRMED */
export type EventRegistration = {
  id: string;
  eventId: string;
  userId: string;
  status: string;
  createdAt: Date;
};

/** category : RACKETS | BALLS | CLOTHING | SHOES | ACCESSORIES */
export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image: string | null;
  rating: number;
  reviews: number;
  isActive: boolean; // false = retiré de la vente
};

/** status : PENDING_PAYMENT | PAID | SHIPPED | DELIVERED | CANCELLED */
export type Order = {
  id: string;
  userId: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  phone: string;
  createdAt: Date;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
};

/**
 * type : RESERVATION | EVENT | SHOP | STRINGING | DONATION
 * status : PENDING | COMPLETED | FAILED | REFUNDED · method : STRIPE | MTN_MONEY | CASH
 */
export type Transaction = {
  id: string;
  userId: string;
  type: string;
  relatedId: string;
  amount: number;
  currency: string;
  status: string;
  method: string | null;
  reference: string | null;
  description: string;
  createdAt: Date;
  paidAt: Date | null;
};

export type Notification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
};

/** status : PENDING_PAYMENT | PENDING | IN_PROGRESS | READY_FOR_PICKUP | COMPLETED */
export type StringingRequest = {
  id: string;
  userId: string;
  racketBrand: string;
  racketModel: string;
  stringType: string;
  tension: number;
  stringPattern: string;
  notes: string | null;
  preferredDate: Date;
  urgent: boolean;
  price: number;
  status: string;
  createdAt: Date;
};

/** category : EQUIPMENT | FACILITY | TOURNAMENT | TRAINING | COMMUNITY | OTHER */
export type Campaign = {
  id: string;
  createdById: string;
  title: string;
  description: string;
  category: string;
  targetAmount: number;
  deadline: Date;
  image: string | null;
  status: string;
  createdAt: Date;
};

/** status : PENDING | COMPLETED */
export type Donation = {
  id: string;
  campaignId: string;
  userId: string;
  amount: number;
  donorName: string | null;
  message: string | null;
  anonymous: boolean;
  status: string;
  createdAt: Date;
};

/** tier : PLATINUM | GOLD | SILVER | PARTNER */
export type Partner = {
  id: string;
  name: string;
  tier: string;
  description: string;
  logo: string | null;
  website: string | null;
  amount: number;
  startDate: Date;
  endDate: Date;
  status: string;
  tagline: string | null; // accroche affichée avec la bannière
  banner: string | null; // bannière 4:1
  placements: string; // HOME,EVENTS,COACHES,DASHBOARD,SHOP
  impressions: number;
  clicks: number;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
};

/** Réglages éditables depuis l'administration : id = clé du réglage, value = JSON */
export type Setting = { id: string; value: string };

/** Journal des actions d'administration */
export type AdminLog = {
  id: string;
  userId: string | null;
  userName: string;
  action: string;
  target: string | null;
  createdAt: Date;
};
