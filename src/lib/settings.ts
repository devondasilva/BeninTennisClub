import { eq } from "drizzle-orm";
import { db, t } from "@/db";
import { MEMBERSHIPS } from "./club";

export type ClubInfo = { phone: string; whatsapp: string; email: string; address: string; addressHint: string; hours: string };
export type Membership = { name: string; price: number; period: string; tag: string; highlight?: boolean; perks: string[] };

export const DEFAULT_CLUB_INFO: ClubInfo = {
  phone: "+229 95 00 00 00", whatsapp: "+229 95 00 00 01", email: "contact@benintennis.club",
  address: "Akpakpa Dodomey, Cotonou", addressHint: "Derrière le stade de l'Amitié", hours: "Tous les jours, 6 h – 24 h",
};

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await db.query.settings.findFirst({ where: eq(t.settings.key, key) });
  if (!row) return fallback;
  try { return { ...(fallback as object), ...JSON.parse(row.value) } as T; } catch { return fallback; }
}

export async function setSetting(key: string, value: unknown) {
  const v = JSON.stringify(value);
  await db.insert(t.settings).values({ key, value: v }).onConflictDoUpdate({ target: t.settings.key, set: { value: v } });
}

export const getClubInfo = () => getSetting<ClubInfo>("club_info", DEFAULT_CLUB_INFO);

export async function getMemberships(): Promise<Membership[]> {
  const row = await db.query.settings.findFirst({ where: eq(t.settings.key, "memberships") });
  if (!row) return MEMBERSHIPS as unknown as Membership[];
  try { return JSON.parse(row.value); } catch { return MEMBERSHIPS as unknown as Membership[]; }
}
