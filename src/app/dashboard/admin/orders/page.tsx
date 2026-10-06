import { Phone, MapPin, Package, Truck, PackageCheck, Clock } from "lucide-react";
import { db } from "@/db";
import { sortBy, withOrderRefs } from "@/db/relations";
import { requireSession } from "@/lib/auth";
import { dateFr, xof } from "@/lib/format";
import { PageHeader, StatusBadge, Empty, StatCard } from "@/components/ui";
import BackLink from "@/components/admin/BackLink";
import { Pills } from "@/components/admin/kit";
import OrderStatus from "./OrderStatus";
import Flash from "@/components/admin/Flash";

export const metadata = { title: "Commandes" };

const TABS = [["PAID", "À expédier"], ["SHIPPED", "Expédiées"], ["DELIVERED", "Livrées"], ["PENDING_PAYMENT", "Non payées"], ["CANCELLED", "Annulées"], ["ALL", "Toutes"]];

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string; ok?: string }> }) {
  await requireSession("orders.manage");
  const { status = "PAID", ok } = await searchParams;
  const all = db.orders.all();
  const orders = withOrderRefs(sortBy(all.filter((o) => status === "ALL" || o.status === status), "createdAt", "desc").slice(0, 100));
  const n = (st: string) => all.filter((o) => st === "ALL" || o.status === st).length;
  const toShipValue = all.filter((o) => o.status === "PAID").reduce((a, o) => a + o.totalAmount, 0);

  return (
    <div>
      <BackLink href="/dashboard/admin" label="Centre de contrôle" />
      <PageHeader eyebrow="Back-office · Boutique" title="Commandes" subtitle="Préparez, expédiez et suivez les commandes de la boutique" />
      <Flash text={ok} />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="À expédier" value={String(n("PAID"))} icon={Package} tone="navy" hint={`${xof(toShipValue)} à préparer`} />
        <StatCard label="En livraison" value={String(n("SHIPPED"))} icon={Truck} tone="sky" />
        <StatCard label="Livrées" value={String(n("DELIVERED"))} icon={PackageCheck} tone="lime" />
        <StatCard label="Non payées" value={String(n("PENDING_PAYMENT"))} icon={Clock} tone="clay" />
      </div>
      <div className="mb-6">
        <Pills label="Filtrer les commandes" items={TABS.map(([k, l]) => ({ href: `?status=${k}`, label: l, active: status === k, count: n(k) }))} />
      </div>
      {orders.length === 0 ? <Empty>Aucune commande dans cette catégorie.</Empty> : (
        <div className="space-y-4">
          {orders.map((o) => (
            <article key={o.id} className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-ink/45">N° {o.id.slice(0, 8).toUpperCase()} · {dateFr(o.createdAt, { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</p>
                  <p className="mt-1 text-lg font-bold text-ink">{o.user ? `${o.user.firstName} ${o.user.lastName}` : "Compte supprimé"}</p>
                  <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
                    <span className="flex items-center gap-1.5"><MapPin size={14} aria-hidden /> {o.shippingAddress}</span>
                    <a href={`tel:${o.phone}`} className="flex items-center gap-1.5 font-semibold text-brand hover:underline"><Phone size={14} aria-hidden /> {o.phone}</a>
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={o.status} />
                  <p className="tabular mt-2 text-2xl font-extrabold tracking-tight text-ink">{xof(o.totalAmount)}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {o.items.map((i) => (
                  <span key={i.id} className="flex items-center gap-2.5 rounded-2xl bg-mist py-1.5 pl-1.5 pr-3.5 text-sm">
                    <img src={i.product.image ?? "/images/logo.svg"} alt="" className="h-10 w-10 rounded-xl bg-white object-cover" />
                    <span><b className="tabular text-ink">{i.quantity} ×</b> {i.product.name}</span>
                  </span>
                ))}
              </div>
              <div className="mt-4 border-t border-ink/[0.06] pt-4"><OrderStatus id={o.id} status={o.status} /></div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
