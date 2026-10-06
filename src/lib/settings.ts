import { db } from "@/db";
import { MEMBERSHIPS } from "./club";

export type ClubInfo = { phone: string; whatsapp: string; email: string; address: string; addressHint: string; hours: string };
export type Membership = { name: string; price: number; period: string; tag: string; highlight?: boolean; perks: string[] };

export const DEFAULT_CLUB_INFO: ClubInfo = {
  phone: "+229 95 00 00 00", whatsapp: "+229 95 00 00 01", email: "contact@benintennis.club",
  address: "Akpakpa Dodomey, Cotonou", addressHint: "Derrière le stade de l'Amitié", hours: "Tous les jours, 6 h – 24 h",
};

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = db.settings.get(key);
  if (!row) return fallback;
  try { return { ...(fallback as object), ...JSON.parse(row.value) } as T; } catch { return fallback; }
}

export async function setSetting(key: string, value: unknown) {
  const v = JSON.stringify(value);
  if (db.settings.get(key)) db.settings.update(key, { value: v });
  else db.settings.insert({ id: key, value: v });
}

export const getClubInfo = () => getSetting<ClubInfo>("club_info", DEFAULT_CLUB_INFO);

export async function getMemberships(): Promise<Membership[]> {
  const row = db.settings.get("memberships");
  if (!row) return MEMBERSHIPS as unknown as Membership[];
  try { return JSON.parse(row.value); } catch { return MEMBERSHIPS as unknown as Membership[]; }
}
