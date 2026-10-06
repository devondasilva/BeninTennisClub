// Données de démonstration du Bénin Tennis Club
// Écrit un fichier JSON par collection dans data/ (aucune dépendance : Node.js seul).
//
//   node scripts/seed.mjs          → crée les données si data/users.json est absent
//   node scripts/seed.mjs --force  → remplace toutes les données (npm run reset)
import { randomUUID, randomBytes, scryptSync } from "crypto";
import { existsSync, mkdirSync, writeFileSync, renameSync, copyFileSync, readdirSync } from "fs";
import { join } from "path";

const DATA_DIR = process.env.DATA_DIR || join(process.cwd(), "data");
const force = process.argv.includes("--force");

if (!force && existsSync(join(DATA_DIR, "users.json"))) process.exit(0);

// Sauvegarde des données actuelles avant un « reset »
if (force && existsSync(join(DATA_DIR, "users.json"))) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const dir = join(DATA_DIR, "sauvegardes", `avant-reset-${stamp}`);
  mkdirSync(dir, { recursive: true });
  for (const f of readdirSync(DATA_DIR)) if (f.endsWith(".json")) copyFileSync(join(DATA_DIR, f), join(dir, f));
  console.log(`💾 Anciennes données sauvegardées dans ${dir}`);
}

const day = (offset, hour = 0, min = 0) => {
  const d = new Date();
  d.setHours(hour, min, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
};
const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const hash = (pw) => {
  const salt = randomBytes(16).toString("hex");
  return `scrypt:${salt}:${scryptSync(pw, salt, 64).toString("hex")}`;
};

const data = {};
const ins = (name, row) => {
  const r = { id: randomUUID(), ...row };
  (data[name] ??= []).push(r);
  return r;
};

// ---------- Comptes ----------
const pw = hash("demo1234");
let avatarIdx = 0;
const addUser = (firstName, lastName, role, email, phone, createdAt = new Date(), extra = {}) => {
  avatarIdx++;
  const avatar = avatarIdx % 2 === 1 ? `/images/avatars/avatar-${(((avatarIdx - 1) / 2) % 12) + 1}.svg` : null;
  return ins("users", {
    email, password: pw, firstName, lastName, phone, role, avatar, address: null, level: null, playingHand: null, bio: null,
    emailNotifications: true, permissions: "", status: "ACTIVE", createdAt, ...extra,
  });
};

const admin = addUser("Rodrigue", "Houngbédji", "ADMIN", "admin@btc.bj", "+229 97 00 00 01", day(-200));
const manager = addUser("Carine", "Adjovi", "MANAGER", "manager@btc.bj", "+229 97 00 00 02", day(-190));
const client = addUser("Devon", "Da Silva", "CLIENT", "client@btc.bj", "+229 96 12 34 56", day(-150), {
  address: "Akpakpa, Cotonou", level: "INTERMEDIAIRE", playingHand: "RIGHT", bio: "Joueur du week-end, fan de terre battue.",
});
const coachUser = addUser("Koffi", "Mensah", "COACH", "coach@btc.bj", "+229 95 11 22 33", day(-180));

const names = [
  ["Aïcha", "Zinsou", "CLIENT"], ["Brice", "Agossou", "CLIENT"], ["Mireille", "Dossou", "PARENT"], ["Sèna", "Hounkpè", "CLIENT"],
  ["Fiacre", "Gbaguidi", "CLIENT"], ["Prisca", "Ahouansou", "PARENT"], ["Ulrich", "Kpadonou", "CLIENT"], ["Nadège", "Azon", "CLIENT"],
  ["Hervé", "Tossou", "STAFF"], ["Gloria", "Akpovi", "CLIENT"], ["Landry", "Sossa", "CLIENT"], ["Rachidatou", "Bello", "PARENT"],
  ["Eric", "Quenum", "SPONSOR"], ["Edwige", "Fagla", "CLIENT"], ["Junior", "Amoussou", "CLIENT"], ["Bénédicte", "Vodounon", "CLIENT"],
];
const members = names.map(([f, l, role], i) =>
  addUser(f, l, role, `${slug(f)}.${slug(l)}@mail.bj`, `+229 9${i % 7} ${10 + i} ${20 + i} ${30 + i}`, day(-120 + i * 7))
);
const everyone = [client, ...members];

// Exemple d'accès précis : une adhérente bénévole qui tient la boutique
addUser("Awa", "Sossou", "CLIENT", "boutique@btc.bj", "+229 96 70 70 70", day(-40), { permissions: "shop.manage,orders.manage" });

// ---------- Terrains ----------
const courts = [
  { name: "Court 1", surface: "Dur (résine bleue)", image: "/images/courts/court-1.svg", pricePerSlot: 5000, description: "Court central éclairé, tribunes de 120 places." },
  { name: "Court 2", surface: "Dur (résine verte)", image: "/images/courts/court-2.svg", pricePerSlot: 5000, description: "Idéal pour l'entraînement, éclairage LED." },
  { name: "Court 3", surface: "Terre battue", image: "/images/courts/court-3.svg", pricePerSlot: 6000, description: "Surface lente, ombragée par les palmiers." },
].map((c) => ins("courts", { ...c, isActive: true }));

// ---------- Coachs ----------
const avail = (rows) => JSON.stringify(rows.map(([d, hours]) => ({ day: d, hours })));
const coaches = [
  { userId: coachUser.id, firstName: "Koffi", lastName: "Mensah", email: "coach@btc.bj", phone: "+229 95 11 22 33", specialization: "Compétition & haut niveau", experience: 12, hourlyRate: 15000, commissionRate: 30, photo: "/images/coaches/coach-1.svg",
    bio: "Ancien n°1 béninois, Koffi a disputé les tournois ITF de la sous-région pendant huit ans avant de se consacrer à l'entraînement. Il prépare aujourd'hui les juniors et les adultes classés qui visent la compétition.",
    diplomas: "Diplôme d'État de tennis (DE)\nCertificat ITF Coach niveau 2\nPremiers secours (PSC1)", languages: "Français, Fon, Anglais",
    achievements: "Champion du Bénin simple messieurs 2009 et 2011\nQuart de finaliste ITF Futures Lomé 2012\n3 juniors sélectionnés en équipe nationale",
    availability: avail([["Lundi", "07:00 – 12:00"], ["Mercredi", "15:00 – 20:00"], ["Vendredi", "07:00 – 12:00"], ["Samedi", "08:00 – 13:00"]]) },
  { firstName: "Estelle", lastName: "Agbo", email: "estelle.agbo@btc.bj", phone: "+229 96 44 55 66", specialization: "Mini-tennis & école de tennis", experience: 8, hourlyRate: 10000, commissionRate: 25, photo: "/images/coaches/coach-2.svg",
    bio: "Responsable pédagogique de l'école de tennis, Estelle accueille les enfants dès 4 ans avec une méthode ludique : balles adaptées, mini-courts et beaucoup de jeu.",
    diplomas: "Diplôme d'État de tennis (DE)\nSpécialisation mini-tennis (ITF Play & Stay)", languages: "Français, Fon, Yoruba",
    achievements: "Plus de 200 enfants initiés depuis 2018\nCréatrice du programme « Raquettes d'or »",
    availability: avail([["Mercredi", "14:00 – 18:00"], ["Samedi", "08:00 – 12:00"], ["Dimanche", "09:00 – 12:00"]]) },
  { firstName: "Serge", lastName: "Houessou", email: "serge.houessou@btc.bj", phone: "+229 97 77 88 99", specialization: "Préparation physique", experience: 10, hourlyRate: 12000, commissionRate: 25, photo: "/images/coaches/coach-3.svg",
    bio: "Préparateur physique diplômé en STAPS, Serge travaille l'explosivité, l'endurance et la prévention des blessures. Il anime aussi les séances de cardio-tennis du soir.",
    diplomas: "Licence STAPS — entraînement sportif\nCertificat de préparateur physique", languages: "Français, Anglais",
    achievements: "Préparateur de l'équipe nationale junior (2019-2022)",
    availability: avail([["Mardi", "17:00 – 21:00"], ["Jeudi", "17:00 – 21:00"], ["Samedi", "07:00 – 10:00"]]) },
  { firstName: "Mariam", lastName: "Soumanou", email: "mariam.soumanou@btc.bj", phone: "+229 94 22 33 44", specialization: "Adultes débutants & loisirs", experience: 5, hourlyRate: 9000, commissionRate: 20, photo: "/images/coaches/coach-4.svg",
    bio: "Mariam aide les adultes à découvrir ou reprendre le tennis en douceur, en cours collectifs ou particuliers. Patience et bonne humeur garanties.",
    diplomas: "Diplôme d'initiateur fédéral\nCertificat cardio-tennis", languages: "Français, Dendi, Anglais",
    achievements: "Fondatrice du groupe « Tennis au féminin » (40 joueuses)",
    availability: avail([["Lundi", "18:00 – 21:00"], ["Mercredi", "18:00 – 21:00"], ["Dimanche", "08:00 – 11:00"]]) },
  { firstName: "Arnaud", lastName: "Dègbo", email: "arnaud.degbo@btc.bj", phone: "+229 97 31 41 51", specialization: "Formateur d'initiateurs & arbitrage", experience: 22, hourlyRate: 18000, commissionRate: 30, photo: "/images/coaches/coach-5.svg",
    bio: "Formateur fédéral, Arnaud forme les futurs initiateurs et arbitres du club. Il intervient aussi en cours particuliers pour les joueurs confirmés qui veulent affiner leur tactique.",
    diplomas: "Diplôme d'État supérieur (DES)\nFormateur de formateurs — Fédération béninoise de tennis\nJuge-arbitre national", languages: "Français, Fon, Anglais",
    achievements: "Plus de 60 initiateurs formés\nJuge-arbitre de l'Open de Cotonou depuis 2010",
    availability: avail([["Mardi", "08:00 – 12:00"], ["Jeudi", "08:00 – 12:00"]]) },
  { firstName: "Fatou", lastName: "Bio Gado", email: "fatou.biogado@btc.bj", phone: "+229 96 61 71 81", specialization: "Tennis fauteuil & sport santé", experience: 7, hourlyRate: 9000, commissionRate: 20, photo: "/images/coaches/coach-6.svg",
    bio: "Fatou anime la section tennis fauteuil et les séances sport santé (seniors, reprise après blessure). Le Court 2 est équipé pour l'accueil en fauteuil.",
    diplomas: "Diplôme d'État de tennis (DE)\nQualification tennis fauteuil ITF\nSport santé sur ordonnance", languages: "Français, Bariba, Anglais",
    achievements: "Création de la section tennis fauteuil (2021)\n2 joueurs classés au circuit africain",
    availability: avail([["Mardi", "09:00 – 12:00"], ["Vendredi", "15:00 – 19:00"], ["Samedi", "14:00 – 17:00"]]) },
].map((c, i) => ins("coaches", { userId: null, ...c, status: "ACTIVE", createdAt: day(-180 + i * 10) }));

const tx = (row) => ins("transactions", { currency: "XOF", reference: null, ...row });

// ---------- Réservations (30 jours passés + 10 à venir) ----------
const bookers = everyone.slice(0, 11);
let rIndex = 0;
for (let offset = -30; offset <= 10; offset++) {
  const perDay = offset < 0 ? 3 + (Math.abs(offset) % 4) : offset <= 3 ? 4 : 2;
  const usedHours = new Set();
  for (let k = 0; k < perDay; k++) {
    const court = courts[(rIndex + k) % 3];
    let hour = 7 + ((rIndex * 3 + k * 4) % 14);
    while (usedHours.has(court.id + hour) || usedHours.has(court.id + (hour + 1))) hour = 7 + ((hour - 6) % 14);
    usedHours.add(court.id + hour);
    usedHours.add(court.id + (hour + 1));
    const slots = k % 3 === 0 ? 4 : 2;
    const start = day(offset, hour);
    const end = new Date(start.getTime() + slots * 30 * 60000);
    const user = offset >= 0 && k === 0 ? client : bookers[(rIndex + k) % bookers.length];
    const coach = k % 2 === 0 ? coaches[(rIndex + k) % coaches.length] : null;
    const price = slots * court.pricePerSlot + (coach ? (coach.hourlyRate * slots) / 2 : 0);
    const res = ins("reservations", { courtId: court.id, userId: user.id, coachId: coach?.id ?? null, startTime: start, endTime: end, price, status: "CONFIRMED", createdAt: day(offset - 2) });
    tx({ userId: user.id, type: "RESERVATION", relatedId: res.id, amount: price, status: "COMPLETED", method: (rIndex + k) % 3 === 0 ? "STRIPE" : "MTN_MONEY", description: `Réservation ${court.name}`, createdAt: day(offset - 2, 10), paidAt: day(offset - 2, 10) });
    if (coach) {
      ins("commissions", {
        coachId: coach.id, reservationId: res.id, clientName: `${user.firstName} ${user.lastName}`, sessionDate: start,
        baseAmount: price, rate: coach.commissionRate, amount: Math.round((price * coach.commissionRate) / 100),
        status: offset < -14 ? "PAID" : offset < 0 ? "COMPLETED" : "PENDING",
        paidAt: offset < -14 ? day(-14) : null, paymentMethod: offset < -14 ? "TRANSFER" : null, createdAt: day(offset - 2),
      });
    }
  }
  rIndex++;
}

// ---------- Événements ----------
const events = [
  { title: "Open de Cotonou 2026", description: "Le tournoi phare du club : simples messieurs et dames, tableaux de la 4e série à 15/1. Dotation de 1 500 000 XOF.", type: "TOURNAMENT", startDate: day(14, 8), endDate: day(21, 19), location: "Courts 1, 2 et 3", capacity: 64, price: 15000, image: "/images/events/tournament.svg" },
  { title: "Stage vacances de la Toussaint", description: "5 jours intensifs pour les 10-16 ans : technique, tactique, préparation physique. Déjeuner inclus.", type: "STAGE", startDate: day(23, 9), endDate: day(27, 16), location: "Court 2", capacity: 20, price: 45000, image: "/images/events/stage.svg" },
  { title: "École de tennis — rentrée", description: "Cours hebdomadaires pour les 5-12 ans, le mercredi et le samedi. Prêt de raquettes pour les débutants.", type: "SCHOOL", startDate: day(5, 14), endDate: day(180, 17), location: "Court 3", capacity: 40, price: 30000, image: "/images/events/school.svg" },
  { title: "Soirée des adhérents", description: "Double mixte surprise, barbecue et musique pour fêter la nouvelle saison.", type: "GATHERING", startDate: day(9, 18), endDate: day(9, 23), location: "Club-house", capacity: 120, price: 0, image: "/images/events/gathering.svg" },
  { title: "Tournoi nocturne en double", description: "Doubles en nocturne sous les projecteurs, format rapide en un set.", type: "TOURNAMENT", startDate: day(35, 19), endDate: day(35, 23), location: "Court 1", capacity: 32, price: 10000, image: "/images/events/night-tournament.svg" },
].map((e) => ins("events", { ...e, status: "ACTIVE" }));
const regs = new Set();
for (let i = 0; i < 30; i++) {
  const ev = events[i % events.length];
  const u = members[(i * 7) % members.length];
  if (regs.has(ev.id + u.id)) continue;
  regs.add(ev.id + u.id);
  ins("event-registrations", { eventId: ev.id, userId: u.id, status: "CONFIRMED", createdAt: day(-10 + (i % 9)) });
}
ins("event-registrations", { eventId: events[0].id, userId: client.id, status: "CONFIRMED", createdAt: day(-3) });

// ---------- Boutique ----------
const products = [
  { name: "Raquette BTC Pro 300", description: "Cadre graphite 300 g, tamis 100 in², équilibre neutre. Pour joueurs confirmés.", category: "RACKETS", price: 85000, stock: 12, image: "/images/products/racket-pro.svg", rating: 4.8, reviews: 34 },
  { name: "Raquette Power 285", description: "Cadre léger et puissant, idéal pour progresser rapidement.", category: "RACKETS", price: 65000, stock: 8, image: "/images/products/racket-power.svg", rating: 4.6, reviews: 21 },
  { name: "Raquette Junior 25\"", description: "Pour les 9-11 ans, légère et maniable.", category: "RACKETS", price: 25000, stock: 20, image: "/images/products/racket-junior.svg", rating: 4.7, reviews: 18 },
  { name: "Tube de 3 balles BTC Pro", description: "Balles pressurisées homologuées, toutes surfaces.", category: "BALLS", price: 5000, stock: 150, image: "/images/products/balls-tube.svg", rating: 4.5, reviews: 96 },
  { name: "Panier de 72 balles", description: "Balles d'entraînement sans pression, panier ramasse-balles inclus.", category: "BALLS", price: 60000, stock: 6, image: "/images/products/balls-basket.svg", rating: 4.4, reviews: 12 },
  { name: "Polo officiel du club", description: "Tissu respirant, logo brodé. Bleu du club.", category: "CLOTHING", price: 15000, stock: 40, image: "/images/products/polo.svg", rating: 4.9, reviews: 52 },
  { name: "Polo blanc compétition", description: "Coupe ajustée, séchage rapide.", category: "CLOTHING", price: 15000, stock: 35, image: "/images/products/polo-white.svg", rating: 4.7, reviews: 27 },
  { name: "Jupe plissée", description: "Avec short intégré, liseré citron.", category: "CLOTHING", price: 12000, stock: 25, image: "/images/products/skirt.svg", rating: 4.6, reviews: 15 },
  { name: "Casquette BTC", description: "Protection solaire, bande anti-transpiration.", category: "ACCESSORIES", price: 7000, stock: 60, image: "/images/products/cap.svg", rating: 4.5, reviews: 40 },
  { name: "Chaussures toutes surfaces", description: "Semelle durable, excellent maintien latéral.", category: "SHOES", price: 55000, stock: 18, image: "/images/products/shoes.svg", rating: 4.6, reviews: 23 },
  { name: "Sac thermo 6 raquettes", description: "Compartiment isotherme, bandoulière rembourrée.", category: "ACCESSORIES", price: 35000, stock: 10, image: "/images/products/bag.svg", rating: 4.8, reviews: 11 },
  { name: "Surgrips × 3", description: "Toucher collant, absorbe la transpiration.", category: "ACCESSORIES", price: 4000, stock: 100, image: "/images/products/grips.svg", rating: 4.7, reviews: 64 },
  { name: "Cordage Poly Tour 12 m", description: "Monofilament polyester 1.25 mm, contrôle et effets.", category: "ACCESSORIES", price: 9000, stock: 45, image: "/images/products/strings.svg", rating: 4.6, reviews: 30 },
].map((p) => ins("products", { ...p, isActive: true }));

const addOrder = (user, status, createdAt, items, method) => {
  const total = items.reduce((s, i) => s + i.p.price * i.q, 0);
  const o = ins("orders", { userId: user.id, status, totalAmount: total, shippingAddress: "Rue 12.045, Akpakpa, Cotonou", phone: user.phone, createdAt });
  for (const i of items) ins("order-items", { orderId: o.id, productId: i.p.id, quantity: i.q, price: i.p.price });
  tx({ userId: user.id, type: "SHOP", relatedId: o.id, amount: total, status: "COMPLETED", method, description: "Commande boutique", createdAt, paidAt: createdAt });
};
addOrder(client, "DELIVERED", day(-12), [{ p: products[0], q: 1 }, { p: products[3], q: 2 }], "MTN_MONEY");
addOrder(client, "SHIPPED", day(-2), [{ p: products[5], q: 1 }, { p: products[8], q: 1 }], "STRIPE");
for (let i = 0; i < 10; i++) {
  addOrder(members[i], i % 3 === 0 ? "SHIPPED" : "DELIVERED", day(-28 + i * 3), [{ p: products[(i * 3) % products.length], q: 1 + (i % 2) }], i % 2 ? "STRIPE" : "MTN_MONEY");
}

// ---------- Cordage ----------
[
  { userId: client.id, racketBrand: "Wilson", racketModel: "Pro Staff 97", stringType: "HYBRID", tension: 24, stringPattern: "16x19", preferredDate: day(1, 10), urgent: true, price: 30000, status: "IN_PROGRESS", notes: "Boyau en montants, polyester en travers." },
  { userId: client.id, racketBrand: "Babolat", racketModel: "Pure Drive", stringType: "SYNTHETIC", tension: 23, stringPattern: "16x19", preferredDate: day(-10, 9), urgent: false, price: 25000, status: "COMPLETED", notes: null },
  { userId: members[1].id, racketBrand: "Head", racketModel: "Speed MP", stringType: "NATURAL", tension: 25, stringPattern: "16x19", preferredDate: day(2, 11), urgent: false, price: 25000, status: "READY_FOR_PICKUP", notes: null },
  { userId: members[3].id, racketBrand: "Yonex", racketModel: "Ezone 100", stringType: "SYNTHETIC", tension: 22, stringPattern: "16x19", preferredDate: day(3, 15), urgent: false, price: 25000, status: "PENDING", notes: null },
  { userId: members[6].id, racketBrand: "Babolat", racketModel: "Pure Aero", stringType: "SYNTHETIC", tension: 24, stringPattern: "16x19", preferredDate: day(1, 16), urgent: true, price: 30000, status: "PENDING", notes: null },
].forEach((s) => {
  const r = ins("stringing-requests", { ...s, createdAt: day(-3) });
  tx({ userId: s.userId, type: "STRINGING", relatedId: r.id, amount: s.price, status: "COMPLETED", method: "MTN_MONEY", description: `Cordage ${s.racketBrand} ${s.racketModel}`, createdAt: day(-3), paidAt: day(-3) });
});

// ---------- Collectes ----------
const campaigns = [
  { createdById: manager.id, title: "Éclairage LED des courts 2 et 3", description: "Remplacer les vieux projecteurs halogènes par des LED pour jouer le soir, réduire la facture d'électricité de 60 % et accueillir des tournois nocturnes.", category: "FACILITY", targetAmount: 4500000, deadline: day(45), image: "/images/campaigns/floodlights.svg", status: "ACTIVE", createdAt: day(-25) },
  { createdById: manager.id, title: "Raquettes pour l'école de tennis", description: "Équiper 40 enfants de raquettes adaptées à leur taille et de balles mousse pour l'initiation.", category: "EQUIPMENT", targetAmount: 1200000, deadline: day(5), image: "/images/campaigns/equipment.svg", status: "ACTIVE", createdAt: day(-30) },
  { createdById: admin.id, title: "Bourses jeunes talents", description: "Financer les déplacements de 6 juniors sélectionnés pour les tournois ITF de la sous-région (Lomé, Abidjan, Dakar).", category: "TRAINING", targetAmount: 3000000, deadline: day(60), image: "/images/campaigns/youth.svg", status: "ACTIVE", createdAt: day(-15) },
  { createdById: manager.id, title: "Dotation de l'Open de Cotonou", description: "Compléter la dotation du tournoi pour attirer les meilleurs joueurs du Bénin et des pays voisins.", category: "TOURNAMENT", targetAmount: 1500000, deadline: day(-3), image: "/images/campaigns/tournament.svg", status: "COMPLETED", createdAt: day(-60) },
].map((c) => ins("campaigns", c));
const plan = [[0, 2800000], [1, 980000], [2, 650000], [3, 1500000]];
const messages = ["Allez le BTC !", "Pour nos jeunes 💚", "Fier de soutenir le club", "Bonne chance aux juniors", null, "Bravo pour l'initiative", null];
for (const [ci, total] of plan) {
  let remaining = total;
  let j = 0;
  while (remaining > 0) {
    const amount = Math.min(remaining, [50000, 25000, 100000, 10000, 250000, 5000, 75000][j % 7]);
    const donor = everyone[(ci * 5 + j) % everyone.length];
    const anonymous = j % 6 === 5;
    const createdAt = day(-20 + (j % 19), 9 + (j % 10));
    const d = ins("donations", {
      campaignId: campaigns[ci].id, userId: donor.id, amount, anonymous, status: "COMPLETED",
      donorName: anonymous ? null : `${donor.firstName} ${donor.lastName}`, message: messages[j % messages.length], createdAt,
    });
    tx({ userId: donor.id, type: "DONATION", relatedId: d.id, amount, status: "COMPLETED", method: j % 2 ? "STRIPE" : "MTN_MONEY", description: `Don — ${campaigns[ci].title}`, createdAt, paidAt: createdAt });
    remaining -= amount;
    j++;
  }
}

// ---------- Partenaires (noms fictifs) ----------
[
  { name: "Atlantique Assurances", tier: "PLATINUM", description: "Partenaire titre de l'Open de Cotonou et assureur officiel du club.", logo: "/images/partners/atlantique.svg", banner: "/images/partners/banner-atlantique.svg", tagline: "Votre santé couverte, sur et hors du court", placements: "HOME,EVENTS,COACHES,DASHBOARD,SHOP", website: "https://example.com", amount: 5000000, startDate: day(-200), endDate: day(165), impressions: 18420, clicks: 512, contactName: "Mme Akakpo", contactEmail: "partenariats@atlantique.example", contactPhone: "+229 21 00 00 01" },
  { name: "Ouémé Tel", tier: "GOLD", description: "Wi-Fi gratuit au club-house et diffusion des matchs en direct.", logo: "/images/partners/ouemetel.svg", banner: "/images/partners/banner-ouemetel.svg", tagline: "Suivez l'Open de Cotonou en direct", placements: "HOME,EVENTS,DASHBOARD", website: "https://example.com", amount: 2500000, startDate: day(-90), endDate: day(275), impressions: 9310, clicks: 287, contactName: "M. Dossa", contactEmail: "sponsoring@ouemetel.example", contactPhone: null },
  { name: "Soleil Boissons", tier: "SILVER", description: "Boissons officielles des tournois et de la soirée des adhérents.", logo: "/images/partners/soleil.svg", banner: "/images/partners/banner-soleil.svg", tagline: "Rafraîchissez chaque set", placements: "EVENTS,SHOP", website: "https://example.com", amount: 1000000, startDate: day(-60), endDate: day(20), impressions: 4105, clicks: 96, contactName: null, contactEmail: null, contactPhone: null },
  { name: "Dodomey Sport & Nutrition", tier: "PARTNER", description: "Réduction de 15 % en magasin pour les adhérents.", logo: "/images/partners/dodomey.svg", banner: "/images/partners/banner-dodomey.svg", tagline: "-15 % pour les adhérents du club", placements: "SHOP,COACHES,DASHBOARD", website: "https://example.com", amount: 400000, startDate: day(-30), endDate: day(335), impressions: 2210, clicks: 131, contactName: null, contactEmail: null, contactPhone: null },
].forEach((p) => ins("partners", { ...p, status: "ACTIVE" }));

// ---------- Avis sur les coachs ----------
const reviewTexts = [
  [5, "Très pédagogue, mon revers a complètement changé en un mois."],
  [5, "Séances intenses mais toujours dans la bonne humeur. Je recommande !"],
  [4, "Super coach, ponctuel et attentif. Les créneaux partent vite."],
  [5, "Mes enfants adorent, ils réclament leur cours chaque semaine."],
  [4, "Très bons conseils tactiques, j'ai gagné mon premier tournoi."],
  [5, "Patient et motivant, parfait pour reprendre après une pause."],
];
coaches.forEach((coach, ci) => {
  for (let k = 0; k < 3 + (ci % 3); k++) {
    const [rating, comment] = reviewTexts[(ci + k) % reviewTexts.length];
    ins("coach-reviews", { coachId: coach.id, userId: everyone[(ci * 3 + k) % everyone.length].id, rating, comment, createdAt: day(-3 - k * 6 - ci) });
  }
});

// ---------- Messages de contact ----------
ins("contact-messages", { name: "Bernadette Kiki", email: "b.kiki@mail.bj", phone: "+229 97 12 12 12", subject: "École de tennis", message: "Bonjour, mon fils a 7 ans, reste-t-il des places le mercredi ?", status: "NEW", createdAt: day(-1, 10) });
ins("contact-messages", { name: "Société Lagune Events", email: "contact@lagune-events.bj", phone: null, subject: "Privatisation", message: "Nous souhaitons privatiser deux courts pour un tournoi d'entreprise en décembre.", status: "READ", createdAt: day(-2, 16) });

// ---------- Notifications ----------
const notifs = (userId) => [
  { userId, type: "RESERVATION_CONFIRMED", title: "Réservation confirmée", message: "Court 1 demain de 18:00 à 20:00.", link: "/dashboard/reservations", read: false, createdAt: day(0, 8) },
  { userId, type: "STRINGING_UPDATE", title: "Cordage en cours", message: "Votre Wilson Pro Staff 97 est entre les mains de notre cordeur.", link: "/dashboard/stringing", read: false, createdAt: day(0, 7) },
  { userId, type: "ORDER_CONFIRMED", title: "Commande expédiée", message: "Votre polo et votre casquette sont en route.", link: "/dashboard/shop/orders", read: false, createdAt: day(-1, 15) },
  { userId, type: "EVENT_REGISTERED", title: "Inscription confirmée", message: "Vous êtes inscrit(e) à l'Open de Cotonou 2026.", link: "/dashboard/events", read: true, createdAt: day(-3, 11) },
  { userId, type: "PAYMENT_CONFIRMED", title: "Merci pour votre don !", message: "Votre don de 50 000 XOF pour l'éclairage LED a bien été reçu.", link: "/dashboard/fundraising", read: true, createdAt: day(-6, 9) },
];
[...notifs(client.id), ...notifs(admin.id).slice(2), ...notifs(manager.id).slice(2)].forEach((n) => ins("notifications", n));

// ---------- Journal d'activité ----------
[
  { userId: admin.id, userName: "Rodrigue Houngbédji", action: "Rôle et accès modifiés", target: "Awa Sossou : Adhérent + Boutique : articles, Commandes", createdAt: day(-40, 10) },
  { userId: manager.id, userName: "Carine Adjovi", action: "Partenaire ajouté", target: "Dodomey Sport & Nutrition", createdAt: day(-30, 9) },
  { userId: manager.id, userName: "Carine Adjovi", action: "Événement créé", target: "Open de Cotonou 2026", createdAt: day(-20, 15) },
  { userId: admin.id, userName: "Rodrigue Houngbédji", action: "Court modifié", target: "Court 3 (prix 5000 → 6000 XOF / 30 min)", createdAt: day(-12, 11) },
  { userId: manager.id, userName: "Carine Adjovi", action: "Commissions réglées", target: "18 commission(s)", createdAt: day(-14, 17) },
].forEach((l) => ins("admin-logs", l));

// Collections sans données de démo (créées vides)
for (const name of ["settings"]) data[name] ??= [];

// ---------- Écriture des fichiers ----------
mkdirSync(DATA_DIR, { recursive: true });
for (const [name, rows] of Object.entries(data)) {
  const file = join(DATA_DIR, `${name}.json`);
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, JSON.stringify(rows, null, 2) + "\n");
  renameSync(tmp, file);
}

console.log(`✅ Données de démonstration créées dans ${DATA_DIR} (${Object.keys(data).length} fichiers).`);
console.log("   Comptes (mot de passe : demo1234) :");
console.log("   • admin@btc.bj    — Administrateur");
console.log("   • manager@btc.bj  — Gestionnaire");
console.log("   • coach@btc.bj    — Coach");
console.log("   • client@btc.bj   — Adhérent");
console.log("   • boutique@btc.bj — Adhérent avec accès précis : boutique + commandes");
