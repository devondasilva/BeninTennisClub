import { eq, sql } from "drizzle-orm";
import { db, t } from "@/db";

export const CATEGORY: Record<string, [string, string]> = {
  EQUIPMENT: ["Équipement", "bg-sky-100 text-sky-800"],
  FACILITY: ["Infrastructure", "bg-purple-100 text-purple-800"],
  TOURNAMENT: ["Tournoi", "bg-amber-100 text-amber-800"],
  TRAINING: ["Formation", "bg-emerald-100 text-emerald-800"],
  COMMUNITY: ["Communauté", "bg-pink-100 text-pink-800"],
  OTHER: ["Autre", "bg-slate-100 text-slate-700"],
};

export async function campaignTotals() {
  const rows = await db
    .select({ campaignId: t.donations.campaignId, total: sql<number>`sum(${t.donations.amount})`, n: sql<number>`count(*)` })
    .from(t.donations)
    .where(eq(t.donations.status, "COMPLETED"))
    .groupBy(t.donations.campaignId);
  return (id: string) => {
    const r = rows.find((x) => x.campaignId === id);
    return { total: r?.total ?? 0, count: r?.n ?? 0 };
  };
}
