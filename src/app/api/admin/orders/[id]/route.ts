import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
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
  const order = db.orders.get(id);
  if (!order) return bad("Commande introuvable", 404);
  if (order.status === "CANCELLED") return bad("Cette commande est déjà annulée");
  if (order.status === "PENDING_PAYMENT" && data.status !== "CANCELLED") return bad("Cette commande n'est pas encore payée");
  const user = db.users.get(order.userId);

  db.orders.update(id, { status: data.status });
  if (data.status === "CANCELLED") {
    // Remet en stock les articles de la commande
    for (const i of db.orderItems.filter((x) => x.orderId === id)) db.products.update(i.productId, (p) => ({ stock: p.stock + i.quantity }));
    db.transactions.updateWhere((t) => t.relatedId === id && t.status === "COMPLETED", { status: "REFUNDED" });
    db.transactions.updateWhere((t) => t.relatedId === id && t.status === "PENDING", { status: "FAILED" });
  }
  if (MSG[data.status]) await notify(order.userId, "ORDER_CONFIRMED", MSG[data.status][0], MSG[data.status][1], "/dashboard/shop/orders");
  await logAction(session, `Commande ${({ PAID: "remise à préparer", SHIPPED: "expédiée", DELIVERED: "livrée", CANCELLED: "annulée" })[data.status]}`, `n° ${id.slice(0, 8).toUpperCase()} — ${user?.firstName ?? ""} ${user?.lastName ?? ""}`);
  return NextResponse.json({ message: "Commande mise à jour" });
}
