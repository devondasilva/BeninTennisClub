import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, t } from "@/db";
import { apiSession, logAction } from "@/lib/auth";
import { bad, parse } from "@/lib/api";
import { storeImage } from "@/lib/uploads";
import { productSchema } from "../schema";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await apiSession("shop.manage");
  if (error) return error;
  const { id } = await params;
  const { data, error: e2 } = await parse(req, productSchema);
  if (e2) return e2;
  const [p] = await db.update(t.products).set({ ...data, image: (await storeImage(data.image)) ?? null }).where(eq(t.products.id, id)).returning();
  if (!p) return bad("Article introuvable", 404);
  await logAction(session, data.isActive ? "Article modifié" : "Article retiré de la vente", p.name);
  return NextResponse.json({ message: "Article enregistré" });
}

// Supprime l'article s'il n'a jamais été commandé, sinon le retire seulement de la vente
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await apiSession("shop.manage");
  if (error) return error;
  const { id } = await params;
  const p = await db.query.products.findFirst({ where: eq(t.products.id, id) });
  if (!p) return bad("Article introuvable", 404);
  const ordered = await db.query.orderItems.findFirst({ where: eq(t.orderItems.productId, id) });
  if (ordered) {
    await db.update(t.products).set({ isActive: false }).where(eq(t.products.id, id));
    await logAction(session, "Article retiré de la vente", p.name);
    return NextResponse.json({ message: "Cet article a déjà été commandé : il est retiré de la vente (historique conservé)", archived: true });
  }
  await db.delete(t.products).where(eq(t.products.id, id));
  await logAction(session, "Article supprimé", p.name);
  return NextResponse.json({ message: "Article supprimé" });
}
