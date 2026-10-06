// Contenu éditorial du club : modifiez librement ces textes et tarifs.

export const MEMBERSHIPS = [
  { name: "Jeune", price: 25000, period: "an", tag: "Moins de 18 ans", perks: ["Accès aux courts aux heures creuses", "-20 % sur l'école de tennis", "Tournois internes gratuits"] },
  { name: "Adulte", price: 60000, period: "an", tag: "Le plus choisi", highlight: true, perks: ["Accès aux courts 6 h – 24 h", "Réservation jusqu'à 14 jours à l'avance", "-10 % à la boutique", "Soirées du club offertes"] },
  { name: "Famille", price: 120000, period: "an", tag: "Jusqu'à 4 personnes", perks: ["Tous les avantages Adulte", "Pour 2 adultes et 2 enfants", "1 stage enfant offert par an"] },
  { name: "Étudiant", price: 35000, period: "an", tag: "Sur justificatif", perks: ["Accès aux courts 6 h – 24 h", "-10 % à la boutique"] },
];

export const LESSONS = [
  { name: "Cours particulier", detail: "1 heure, 1 joueur", price: "dès 9 000 XOF + court" },
  { name: "Cours à deux", detail: "1 heure, 2 joueurs", price: "dès 6 000 XOF / pers. + court" },
  { name: "École de tennis", detail: "5-12 ans, 2 séances / semaine", price: "30 000 XOF / trimestre" },
  { name: "Stage vacances", detail: "5 jours, 10-16 ans, déjeuner inclus", price: "45 000 XOF" },
  { name: "Cardio-tennis", detail: "Séance collective d'1 h", price: "3 000 XOF" },
];

export const HISTORY = [
  { year: "1998", text: "Fondation du club par un groupe de passionnés sur un terrain d'Akpakpa Dodomey." },
  { year: "2006", text: "Construction du Court 3 en terre battue, le seul de Cotonou." },
  { year: "2012", text: "Première édition de l'Open de Cotonou, devenu le rendez-vous du tennis béninois." },
  { year: "2018", text: "Lancement de l'école de tennis : plus de 200 enfants initiés depuis." },
  { year: "2021", text: "Ouverture de la section tennis fauteuil et accessibilité complète du Court 2." },
  { year: "2026", text: "Le club passe au numérique : réservation, paiement et inscriptions en ligne." },
];

export const VALUES = [
  { title: "Excellence", text: "Des coachs diplômés et un suivi personnalisé, du débutant au joueur classé." },
  { title: "Famille", text: "Un club où l'on vient à trois générations, où chacun connaît chacun." },
  { title: "Ouverture", text: "Tarifs accessibles, bourses pour les jeunes talents, tennis fauteuil." },
  { title: "Fair-play", text: "Le respect de l'adversaire, de l'arbitre et du court, sur et en dehors du terrain." },
];

export const FACILITIES = [
  { title: "3 courts éclairés", text: "Deux courts en résine et un en terre battue, éclairage pour jouer jusqu'à minuit." },
  { title: "Club-house", text: "Bar, terrasse ombragée et Wi-Fi gratuit pour se retrouver après les matchs." },
  { title: "Vestiaires & douches", text: "Vestiaires hommes et femmes, casiers sécurisés." },
  { title: "Accès fauteuil", text: "Rampes, vestiaire adapté et Court 2 équipé pour le tennis fauteuil." },
  { title: "Atelier cordage", text: "Machine électronique, recordage en 48 h (24 h en express)." },
  { title: "Parking gardé", text: "Parking gratuit et surveillé pour les membres." },
];

export const BOARD = [
  { name: "Rodrigue Houngbédji", role: "Président", avatar: "/images/avatars/avatar-1.svg" },
  { name: "Carine Adjovi", role: "Directrice sportive", avatar: "/images/avatars/avatar-2.svg" },
  { name: "Hervé Tossou", role: "Trésorier", avatar: "/images/avatars/avatar-3.svg" },
  { name: "Prisca Ahouansou", role: "Secrétaire générale", avatar: "/images/avatars/avatar-4.svg" },
];
