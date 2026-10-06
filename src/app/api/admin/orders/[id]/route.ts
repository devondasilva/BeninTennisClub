import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db, t } from "@/db";
import { apiSession, logAction } from "@/lib/auth";
import { bad, parse } from "@/lib/api";
import { notify } from "@/lib/notify";

const schema = z.object({ status: z.enum(["PAID", "SHIPPED", "DELIVERED", "CANCELLED"]) });
const MSG: Record<string, [string, string]> = {
  SHIPPED: ["Commande expédiée", "Votre commande est en route. Le livreur vous appellera avant de passer."],
  DELIVERED: ["Commande livrée", "Votre commande a été livrée. Merci et bon jeu !"],
  CANCELLED: ["Commande annulée", "Votre commande a été annulée. Si vous l'aviez payée, le remboursement est effectué sous 5 jours."],
};

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await apiSession("orders.manage");
  if (error) return error;
  const { id } = await params;
  const { data, error: e2 } = await parse(req, schema);
  if (e2) return e2;
  const order = await db.query.orders.findFirst({ where: eq(t.orders.id, id), with: { items: true, user: true } });
  if (!order) return bad("Commande introuvable", 404);
  if (order.status === "CANCELLED") return bad("Cette commande est déjà annulée");
  if (order.status === "PENDING_PAYMENT" && data.status !== "CANCELLED") return bad("Cette commande n'est pas encore payée");

  await db.update(t.orders).set({ status: data.status }).where(eq(t.orders.id, id));
  if (data.status === "CANCELLED") {
    for (const i of order.items) await db.update(t.products).set({ stock: sql`${t.products.stock} + ${i.quantity}` }).where(eq(t.products.id, i.productId));
    await db.update(t.transactions).set({ status: "REFUNDED" }).where(and(eq(t.transactions.relatedId, id), eq(t.transactions.status, "COMPLETED")));
    await db.update(t.transactions).set({ status: "FAILED" }).where(and(eq(t.transactions.relatedId, id), eq(t.transactions.status, "PENDING")));
  }
  if (MSG[data.status]) await notify(order.userId, "ORDER_CONFIRMED", MSG[data.status][0], MSG[data.status][1], "/dashboard/shop/orders");
  await logAction(session, `Commande ${({ PAID: "remise à préparer", SHIPPED: "expédiée", DELIVERED: "livrée", CANCELLED: "annulée" })[data.status]}`, `n° ${id.slice(0, 8).toUpperCase()} — ${order.user.firstName} ${order.user.lastName}`);
  return NextResponse.json({ message: "Commande mise à jour" });
}
