// Permissions fines de l'application (utilisable côté serveur et navigateur)

export const PERMISSIONS = {
  "members.manage": { label: "Adhérents", desc: "Créer, modifier et suspendre des comptes membres", group: "Club" },
  "content.manage": { label: "Infos du club", desc: "Coordonnées, horaires et tarifs d'adhésion du site", group: "Club" },
  "messages.manage": { label: "Messages du site", desc: "Lire les messages du formulaire de contact", group: "Club" },
  "analytics.view": { label: "Statistiques", desc: "Chiffre d'affaires, occupation des courts, ventes", group: "Club" },
  "courts.manage": { label: "Courts & tarifs", desc: "Ajouter des courts, changer les prix, fermer un court", group: "Activités" },
  "reservations.manage": { label: "Réservations", desc: "Voir et annuler toutes les réservations du club", group: "Activités" },
  "events.manage": { label: "Événements", desc: "Créer, modifier, annuler des événements et voir les inscrits", group: "Activités" },
  "coaches.manage": { label: "Coachs", desc: "Ajouter des coachs, modifier leurs fiches et tarifs", group: "Activités" },
  "commissions.manage": { label: "Commissions", desc: "Régler les commissions des coachs", group: "Activités" },
  "stringing.manage": { label: "Atelier cordage", desc: "Suivre et mettre à jour les demandes de cordage", group: "Activités" },
  "shop.manage": { label: "Boutique : articles", desc: "Ajouter des articles, modifier prix, photos et stock", group: "Ventes" },
  "orders.manage": { label: "Commandes", desc: "Suivre les commandes, passer en expédiée / livrée, annuler", group: "Ventes" },
  "payments.manage": { label: "Paiements", desc: "Voir tous les paiements, encaisser en espèces, rembourser", group: "Ventes" },
  "fundraising.manage": { label: "Collectes", desc: "Lancer, modifier et clôturer des collectes", group: "Ventes" },
  "partners.manage": { label: "Partenaires & pub", desc: "Gérer les sponsors et leurs bannières", group: "Ventes" },
} as const;

export type Permission = keyof typeof PERMISSIONS | "access.manage";
export const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as Permission[];

/** Droits fournis automatiquement par chaque rôle (l'admin peut en ajouter membre par membre) */
export const ROLE_PRESETS: Record<string, Permission[]> = {
  ADMIN: [...ALL_PERMISSIONS, "access.manage"],
  MANAGER: [...ALL_PERMISSIONS],
  STAFF: ["reservations.manage", "stringing.manage", "orders.manage", "messages.manage"],
  COACH: [],
  PARENT: [],
  CLIENT: [],
  SPONSOR: [],
};

export function effectivePermissions(role: string, extra: string) {
  const set = new Set<string>(ROLE_PRESETS[role] ?? []);
  for (const p of extra.split(",").map((x) => x.trim()).filter(Boolean)) if (p in PERMISSIONS) set.add(p);
  return set;
}
