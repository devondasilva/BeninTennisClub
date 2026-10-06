import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { db, t } from "@/db";
import { requireSession } from "@/lib/auth";
import { dateFr, xof } from "@/lib/format";
import { Empty, PageHeader, StatusBadge } from "@/components/ui";

export const metadata = { title: "Mes commandes" };

const STEPS = ["PAID", "SHIPPED", "DELIVERED"];

export default async function OrdersPage() {
  const s = await requireSession();
  const orders = await db.query.orders.findMany({
    where: eq(t.orders.userId, s.userId),
    with: { items: { with: { product: true } } },
    orderBy: desc(t.orders.createdAt),
  });
  const pending = await db.query.transactions.findMany({ where: and(eq(t.transactions.userId, s.userId), eq(t.transactions.type, "SHOP"), eq(t.transactions.status, "PENDING")) });

  return (
    <div>
      <PageHeader title="Mes commandes" action={<Link href="/dashboard/shop" className="btn-accent">Retour à la boutique</Link>} />
      {orders.length === 0 ? <Empty>Aucune commande pour l'instant.</Empty> : (
        <div className="space-y-4">
          {orders.map((o) => {
            const step = STEPS.indexOf(o.status);
            const tx = pending.find((p) => p.relatedId === o.id);
            return (
              <div key={o.id} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-primary-400">Commande n° {o.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm text-slate-500">Passée le {dateFr(o.createdAt)} · {o.shippingAddress}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={o.status} />
                    <span className="text-lg font-bold text-primary-400">{xof(o.totalAmount)}</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {o.items.map((i) => (
                    <div key={i.id} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2 pr-4">
                      <img src={i.product.image ?? ""} alt="" className="h-12 w-12 rounded-lg object-cover" />
                      <div className="text-sm"><p className="font-medium">{i.product.name}</p><p className="text-slate-500">{i.quantity} × {xof(i.price)}</p></div>
                    </div>
                  ))}
                </div>
                {step >= 0 && (
                  <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
                    {["Payée", "Expédiée", "Livrée"].map((l, i) => (
                      <div key={l}>
                        <div className={`h-1.5 rounded-full ${i <= step ? "bg-accent-500" : "bg-slate-100"}`} />
                        <p className={`mt-1.5 ${i <= step ? "text-primary-400" : "text-slate-400"}`}>{l}</p>
                      </div>
                    ))}
                  </div>
                )}
                {tx && <Link href={`/dashboard/payments/${tx.id}`} className="btn-accent mt-4">Payer cette commande</Link>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
