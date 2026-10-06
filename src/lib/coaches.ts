import { db } from "@/db";

export type Slot = { day: string; hours: string };

export const lines = (s?: string | null) => (s ?? "").split("\n").map((l) => l.trim()).filter(Boolean);

export function parseAvailability(s?: string | null): Slot[] {
  try {
    const v = JSON.parse(s ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

/** Note moyenne et nombre d'avis par coach */
export async function coachRatings() {
  const reviews = db.coachReviews.all();
  return (id: string) => {
    const mine = reviews.filter((r) => r.coachId === id);
    return { avg: mine.length ? mine.reduce((s, r) => s + r.rating, 0) / mine.length : 0, count: mine.length };
  };
}
