import { sql } from "drizzle-orm";
import { db, t } from "@/db";

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
  const rows = await db
    .select({ coachId: t.coachReviews.coachId, avg: sql<number>`avg(${t.coachReviews.rating})`, n: sql<number>`count(*)` })
    .from(t.coachReviews)
    .groupBy(t.coachReviews.coachId);
  return (id: string) => {
    const r = rows.find((x) => x.coachId === id);
    return { avg: r ? Number(r.avg) : 0, count: r?.n ?? 0 };
  };
}
