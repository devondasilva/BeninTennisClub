import { db } from "@/db";

export const CATEGORY: Record<string, [string, string]> = {
  EQUIPMENT: ["Équipement", "bg-sky-100 text-sky-800"],
  FACILITY: ["Infrastructure", "bg-purple-100 text-purple-800"],
  TOURNAMENT: ["Tournoi", "bg-amber-100 text-amber-800"],
  TRAINING: ["Formation", "bg-emerald-100 text-emerald-800"],
  COMMUNITY: ["Communauté", "bg-pink-100 text-pink-800"],
  OTHER: ["Autre", "bg-slate-100 text-slate-700"],
};

export async function campaignTotals() {
  const done = db.donations.filter((d) => d.status === "COMPLETED");
  return (id: string) => {
    const mine = done.filter((d) => d.campaignId === id);
    return { total: mine.reduce((s, d) => s + d.amount, 0), count: mine.length };
  };
}
