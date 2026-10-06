import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db, t } from "@/db";

export const PLACEMENTS: Record<string, { label: string; hint: string }> = {
  HOME: { label: "Accueil du site", hint: "Grande bannière entre les sections de la page d'accueil" },
  EVENTS: { label: "Événements", hint: "Page Événements du site et de l'espace membre" },
  COACHES: { label: "Fiches coachs", hint: "Colonne latérale des fiches coachs et de la liste" },
  DASHBOARD: { label: "Tableau de bord", hint: "Accueil de l'espace membre (tous les adhérents connectés)" },
  SHOP: { label: "Boutique", hint: "En haut de la boutique du club" },
};

export const TIERS: Record<string, { label: string; color: string }> = {
  PLATINUM: { label: "Platine", color: "bg-slate-800 text-white" },
  GOLD: { label: "Or", color: "bg-amber-400 text-amber-950" },
  SILVER: { label: "Argent", color: "bg-slate-200 text-slate-700" },
  PARTNER: { label: "Partenaire", color: "bg-accent-200 text-primary-400" },
};

/** URL d'affichage d'une image partenaire (fichier fourni ou image envoyée stockée en base) */
export function partnerImage(p: { id: string; logo: string | null; banner: string | null }, kind: "logo" | "banner") {
  const v = p[kind];
  if (!v) return null;
  if (v.startsWith("/")) return v;
  return `/api/partners/${p.id}/image?kind=${kind}&v=${v.length}`;
}

export const partnerClickUrl = (id: string) => `/api/partners/${id}/click`;

/** Partenaires actifs aujourd'hui */
export function activeFilter() {
  const now = new Date();
  return and(eq(t.partners.status, "ACTIVE"), lte(t.partners.startDate, now), gte(t.partners.endDate, now));
}

/**
 * Choisit une bannière pour un emplacement (rotation pondérée par le niveau de partenariat)
 * et compte un affichage. Renvoie null si l'emplacement est libre.
 */
export async function pickAd(placement: string) {
  const list = (await db.query.partners.findMany({ where: activeFilter() })).filter(
    (p) => p.banner && p.placements.split(",").includes(placement)
  );
  if (!list.length) return null;
  const weight: Record<string, number> = { PLATINUM: 4, GOLD: 3, SILVER: 2, PARTNER: 1 };
  const total = list.reduce((s, p) => s + (weight[p.tier] ?? 1), 0);
  let r = Math.random() * total;
  const ad = list.find((p) => (r -= weight[p.tier] ?? 1) < 0) ?? list[0];
  await db.update(t.partners).set({ impressions: sql`${t.partners.impressions} + 1` }).where(eq(t.partners.id, ad.id));
  return { id: ad.id, name: ad.name, tagline: ad.tagline, banner: partnerImage(ad, "banner")!, href: partnerClickUrl(ad.id) };
}
