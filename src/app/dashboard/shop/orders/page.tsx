import Link from "next/link";
import { Package, Truck, Wallet, MapPin } from "lucide-react";
import { db } from "@/db";
import { sortBy, withOrderRefs } from "@/db/relations";
import { requireSession } from "@/lib/auth";
import { dateFr, xof } from "@/lib/format";
import { Empty, PageHeader, StatCard, StatusBadge } from "@/components/ui";

export const metadata = { title: "Mes commandes" };

const STEPS = ["PAID", "SHIPPED", "DELIVERED"];

export default async function OrdersPage() {
  const s = await requireSession();
  const orders = withOrderRefs(sortBy(db.orders.filter((o) => o.userId === s.userId), "createdAt", "desc"));
  const pending = db.transactions.filter((t) => t.userId === s.userId && t.type === "SHOP" && t.status === "PENDING");

  const paidOrders = orders.filter((o) => ["PAID", "SHIPPED", "DELIVERED"].includes(o.status));
  const spent = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const inTransit = orders.filter((o) => o.status === "PAID" || o.status === "SHIPPED").length;

  return (
    <div>
      <PageHeader eyebrow="Boutique officielle" title="Mes commandes" subtitle="Suivez la préparation et la livraison de vos achats."
        action={<Link href="/dashboard/shop" className="btn-primary">Retour à la boutique</Link>} />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Commandes" value={String(orders.length)} icon={Package} tone="navy" />
        <StatCard label="En préparation / livraison" value={String(inTransit)} icon={Truck} tone="sky" />
        <StatCard label="Total dépensé" value={xof(spent)} icon={Wallet} tone="lime" />
      </div>

      {orders.length === 0 ? <Empty>Aucune commande pour l'instant.</Empty> : (
        <div className="space-y-5">
          {orders.map((o) => {
            const step = STEPS.indexOf(o.status);
            const tx = pending.find((p) => p.relatedId === o.id);
            return (
              <article key={o.id} className="card p-6 md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/45">Passée le {dateFr(o.createdAt)}</p>
                    <p className="mt-1 font-display text-xl font-black tracking-tight text-ink">Commande n° {o.id.slice(0, 8).toUpperCase()}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted"><MapPin size={14} className="text-brand" /> {o.shippingAddress}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={o.status} />
                    <span className="tabular font-display text-2xl font-black text-brand">{xof(o.totalAmount)}</span>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  {o.items.map((i) => (
                    <div key={i.id} className="flex items-center gap-3 rounded-2xl border border-ink/[0.06] bg-mist/70 p-2 pr-4">
                      <img src={i.product.image ?? ""} alt="" className="h-12 w-12 rounded-xl bg-white object-cover" />
                      <div className="text-sm"><p className="font-semibold text-ink">{i.product.name}</p><p className="text-muted">{i.quantity} × {xof(i.price)}</p></div>
                    </div>
                  ))}
                </div>
                {step >= 0 && (
                  <ol className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] font-bold uppercase tracking-widest" aria-label="Suivi de la commande">
                    {["Payée", "Expédiée", "Livrée"].map((l, i) => (
                      <li key={l} aria-current={i === step ? "step" : undefined}>
                        <div className={`h-1.5 rounded-full ${i <= step ? "bg-gradient-to-r from-brand to-lime-dark" : "bg-cloud"}`} />
                        <p className={`mt-2 ${i <= step ? "text-ink" : "text-ink/35"}`}>{l}</p>
                      </li>
                    ))}
                  </ol>
                )}
                {tx && <Link href={`/dashboard/payments/${tx.id}`} className="btn-primary mt-6">Payer cette commande</Link>}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
