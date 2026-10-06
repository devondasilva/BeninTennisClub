import { eq } from "drizzle-orm";
import { db, t } from "@/db";
import { apiSession } from "@/lib/auth";
import { bad } from "@/lib/api";

export async function loadOwnTx(id: string) {
  const { session, error } = await apiSession();
  if (error) return { tx: null, error };
  const tx = await db.query.transactions.findFirst({ where: eq(t.transactions.id, id) });
  if (!tx || tx.userId !== session.userId) return { tx: null, error: bad("Paiement introuvable", 404) };
  if (tx.status !== "PENDING") return { tx: null, error: bad("Ce paiement n'est plus en attente") };
  return { tx, error: null };
}
