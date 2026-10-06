import { NextResponse } from "next/server";
import { db } from "@/db";
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
  if (!db.products.get(id)) return bad("Article introuvable", 404);
  const p = db.products.update(id, { ...data, image: (await storeImage(data.image)) ?? null });
  if (!p) return bad("Article introuvable", 404);
  await logAction(session, data.isActive ? "Article modifié" : "Article retiré de la vente", p.name);
  return NextResponse.json({ message: "Article enregistré" });
}

// Supprime l'article s'il n'a jamais été commandé, sinon le retire seulement de la vente
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await apiSession("shop.manage");
  if (error) return error;
  const { id } = await params;
  const p = db.products.get(id);
  if (!p) return bad("Article introuvable", 404);
  const ordered = db.orderItems.find((i) => i.productId === id);
  if (ordered) {
    db.products.update(id, { isActive: false });
    await logAction(session, "Article retiré de la vente", p.name);
    return NextResponse.json({ message: "Cet article a déjà été commandé : il est retiré de la vente (historique conservé)", archived: true });
  }
  db.products.remove(id);
  await logAction(session, "Article supprimé", p.name);
  return NextResponse.json({ message: "Article supprimé" });
}
