import { eq, inArray, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db, t } from "@/db";
import { apiSession } from "@/lib/auth";
import { bad, parse } from "@/lib/api";
import { createTransaction } from "@/lib/payments";

const schema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })).min(1, "Panier vide"),
  shippingAddress: z.string().min(5, "Adresse de livraison requise"),
  phone: z.string().min(8, "Téléphone requis"),
});

export async function POST(req: Request) {
  const { session, error } = await apiSession();
  if (error) return error;
  const { data, error: e2 } = await parse(req, schema);
  if (e2) return e2;

  const products = await db.query.products.findMany({ where: inArray(t.products.id, data.items.map((i) => i.productId)) });
  let total = 0;
  for (const item of data.items) {
    const p = products.find((x) => x.id === item.productId);
    if (!p || !p.isActive) return bad("Un article de votre panier n'est plus en vente");
    if (p.stock < item.quantity) return bad(`Stock insuffisant pour « ${p.name} » (reste ${p.stock})`);
    total += p.price * item.quantity;
  }
  const delivery = total >= 50000 ? 0 : 2000;
  total += delivery;

  const [order] = await db.insert(t.orders).values({ userId: session.userId, totalAmount: total, shippingAddress: data.shippingAddress, phone: data.phone }).returning();
  await db.insert(t.orderItems).values(data.items.map((i) => ({ orderId: order.id, productId: i.productId, quantity: i.quantity, price: products.find((p) => p.id === i.productId)!.price })));
  // Réserve le stock
  for (const i of data.items) {
    await db.update(t.products).set({ stock: sql`${t.products.stock} - ${i.quantity}` }).where(eq(t.products.id, i.productId));
  }
  const n = data.items.reduce((s, i) => s + i.quantity, 0);
  const tx = await createTransaction(session.userId, "SHOP", order.id, total, `Commande boutique (${n} article${n > 1 ? "s" : ""})`);
  return NextResponse.json({ order, paymentUrl: `/dashboard/payments/${tx.id}` }, { status: 201 });
}
