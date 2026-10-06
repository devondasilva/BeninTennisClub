import { db } from "./index";
import { hashPassword } from "@/lib/password";

const day = (offset: number, hour = 0, min = 0) => {
  const d = new Date();
  d.setHours(hour, min, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
};

const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export async function seedDemoData() {
  console.log("🌱 Remplissage de la base de démonstration...");

  for (const key of [
    "adminLogs",
    "settings",
    "coachReviews",
    "contactMessages",
    "notifications",
    "commissions",
    "transactions",
    "orderItems",
    "orders",
    "donations",
    "campaigns",
    "stringingRequests",
    "eventRegistrations",
    "events",
    "reservations",
    "coaches",
    "courts",
    "products",
    "partners",
    "users",
  ] as const) {
    db[key].replaceAll([]);
  }

  const pw = hashPassword("demo1234");
  let avatarIdx = 0;

  const addUser = (
    firstName: string,
    lastName: string,
    role: string,
    email: string,
    phone: string,
    createdAt = new Date(),
    extra: Record<string, unknown> = {}
  ) => {
    avatarIdx += 1;
    const avatar = avatarIdx % 2 === 1 ? `/images/avatars/avatar-${((avatarIdx - 1) / 2) % 12 + 1}.svg` : null;
    return db.users.insert({
      firstName,
      lastName,
      role,
      email,
      phone,
      password: pw,
      avatar,
      address: null,
      level: null,
      playingHand: null,
      bio: null,
      emailNotifications: true,
      permissions: "",
      status: "ACTIVE",
      createdAt,
      ...extra,
    } as any);
  };

  const admin = addUser("Rodrigue", "Houngbédji", "ADMIN", "admin@btc.bj", "+229 97 00 00 01", day(-200));
  const manager = addUser("Carine", "Adjovi", "MANAGER", "manager@btc.bj", "+229 97 00 00 02", day(-190));
  const client = addUser("Devon", "Da Silva", "CLIENT", "client@btc.bj", "+229 96 12 34 56", day(-150), {
    address: "Akpakpa, Cotonou",
    level: "INTERMEDIAIRE",
    playingHand: "RIGHT",
    bio: "Joueur du week-end, fan de terre battue.",
  });
  const coachUser = addUser("Koffi", "Mensah", "COACH", "coach@btc.bj", "+229 95 11 22 33", day(-180));

  const names = [
    ["Aïcha", "Zinsou", "CLIENT"],
    ["Brice", "Agossou", "CLIENT"],
    ["Mireille", "Dossou", "PARENT"],
    ["Sèna", "Hounkpè", "CLIENT"],
    ["Fiacre", "Gbaguidi", "CLIENT"],
    ["Prisca", "Ahouansou", "PARENT"],
    ["Ulrich", "Kpadonou", "CLIENT"],
    ["Nadège", "Azon", "CLIENT"],
    ["Hervé", "Tossou", "STAFF"],
    ["Gloria", "Akpovi", "CLIENT"],
    ["Landry", "Sossa", "CLIENT"],
    ["Rachidatou", "Bello", "PARENT"],
    ["Eric", "Quenum", "SPONSOR"],
    ["Edwige", "Fagla", "CLIENT"],
    ["Junior", "Amoussou", "CLIENT"],
    ["Bénédicte", "Vodounon", "CLIENT"],
  ];

  const members = names.map(([f, l, role], i) =>
    addUser(f, l, role, `${slug(f)}.${slug(l)}@mail.bj`, `+229 9${i % 7} ${10 + i} ${20 + i} ${30 + i}`, day(-120 + i * 7))
  );
  const everyone = [client, ...members];

  addUser("Awa", "Sossou", "CLIENT", "boutique@btc.bj", "+229 96 70 70 70", day(-40), {
    permissions: "shop.manage,orders.manage",
  });

  const courts = db.courts.insertMany([
    {
      name: "Court 1",
      surface: "Dur (résine bleue)",
      image: "/images/courts/court-1.svg",
      pricePerSlot: 5000,
      description: "Court central éclairé, tribunes de 120 places.",
      isActive: true,
    },
    {
      name: "Court 2",
      surface: "Dur (résine verte)",
      image: "/images/courts/court-2.svg",
      pricePerSlot: 5000,
      description: "Idéal pour l'entraînement, éclairage LED.",
      isActive: true,
    },
    {
      name: "Court 3",
      surface: "Terre battue",
      image: "/images/courts/court-3.svg",
      pricePerSlot: 6000,
      description: "Surface lente, ombragée par les palmiers.",
      isActive: true,
    },
  ] as any);

  const avail = (rows: [string, string][]) => JSON.stringify(rows.map(([dayName, hours]) => ({ day: dayName, hours })));

  const coaches = db.coaches.insertMany([
    {
      userId: coachUser.id,
      firstName: "Koffi",
      lastName: "Mensah",
      email: "coach@btc.bj",
      phone: "+229 95 11 22 33",
      specialization: "Compétition & haut niveau",
      experience: 12,
      hourlyRate: 15000,
      commissionRate: 30,
      photo: "/images/coaches/coach-1.svg",
      bio: "Ancien n°1 béninois, Koffi a disputé les tournois ITF de la sous-région pendant huit ans avant de se consacrer à l'entraînement.",
      diplomas: "Diplôme d'État de tennis (DE)\nCertificat ITF Coach niveau 2\nPremiers secours (PSC1)",
      languages: "Français, Fon, Anglais",
      achievements: "Champion du Bénin simple messieurs 2009 et 2011\nQuart de finaliste ITF Futures Lomé 2012",
      availability: avail([["Lundi", "07:00 – 12:00"], ["Mercredi", "15:00 – 20:00"], ["Vendredi", "07:00 – 12:00"], ["Samedi", "08:00 – 13:00"]]),
      status: "ACTIVE",
      createdAt: day(-180),
    },
    {
      firstName: "Estelle",
      lastName: "Agbo",
      email: "estelle.agbo@btc.bj",
      phone: "+229 96 44 55 66",
      specialization: "Mini-tennis & école de tennis",
      experience: 8,
      hourlyRate: 10000,
      commissionRate: 25,
      photo: "/images/coaches/coach-2.svg",
      bio: "Responsable pédagogique de l'école de tennis, Estelle accueille les enfants dès 4 ans avec une méthode ludique.",
      diplomas: "Diplôme d'État de tennis (DE)\nSpécialisation mini-tennis (ITF Play & Stay)",
      languages: "Français, Fon, Yoruba",
      achievements: "Plus de 200 enfants initiés depuis 2018",
      availability: avail([["Mercredi", "14:00 – 18:00"], ["Samedi", "08:00 – 12:00"], ["Dimanche", "09:00 – 12:00"]]),
      status: "ACTIVE",
      createdAt: day(-170),
    },
  ] as any);

  db.contactMessages.insertMany([
    {
      name: "Bernadette Kiki",
      email: "b.kiki@mail.bj",
      phone: "+229 97 12 12 12",
      subject: "École de tennis",
      message: "Bonjour, mon fils a 7 ans, reste-t-il des places le mercredi ?",
      createdAt: day(-1, 10),
      status: "NEW",
    },
    {
      name: "Société Lagune Events",
      email: "contact@lagune-events.bj",
      subject: "Privatisation",
      message: "Nous souhaitons privatiser deux courts pour un tournoi d'entreprise en décembre.",
      createdAt: day(-2, 16),
      status: "READ",
    },
  ] as any);

  db.notifications.insertMany([
    {
      userId: client.id,
      type: "RESERVATION_CONFIRMED",
      title: "Réservation confirmée",
      message: "Court 1 demain de 18:00 à 20:00.",
      link: "/dashboard/reservations",
      createdAt: day(0, 8),
      read: false,
    },
    {
      userId: admin.id,
      type: "ORDER_CONFIRMED",
      title: "Commande expédiée",
      message: "Votre polo et votre casquette sont en route.",
      link: "/dashboard/shop/orders",
      createdAt: day(-1, 15),
      read: false,
    },
  ] as any);

  db.adminLogs.insertMany([
    {
      userId: admin.id,
      userName: "Rodrigue Houngbédji",
      action: "Rôle et accès modifiés",
      target: "Awa Sossou : Adhérent + Boutique : articles, Commandes",
      createdAt: day(-40, 10),
    },
  ] as any);

  console.log("✅ Données de démo chargées.");
  console.log("   Comptes (mot de passe : demo1234) :");
  console.log("   • admin@btc.bj    — Administrateur");
  console.log("   • manager@btc.bj  — Gestionnaire");
  console.log("   • coach@btc.bj    — Coach");
  console.log("   • client@btc.bj   — Adhérent");
  console.log("   • boutique@btc.bj — Adhérent avec accès précis : boutique + commandes");

  return { admin, manager, client, coachUser, courts, coaches, members, everyone };
}

export default seedDemoData;

if (process.argv[1]?.includes("seed") || process.argv[1]?.includes("reset")) {
  seedDemoData().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
