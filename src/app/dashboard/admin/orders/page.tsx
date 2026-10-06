import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Phone, MapPin } from "lucide-react";
import { db, t } from "@/db";
import { requireSession } from "@/lib/auth";
import { dateFr, xof } from "@/lib/format";
import { PageHeader, StatusBadge, Empty } from "@/components/ui";
import BackLink from "@/components/admin/BackLink";
import OrderStatus from "./OrderStatus";
import Flash from "@/components/admin/Flash";

export const metadata = { title: "Commandes" };

const TABS = [["PAID", "À expédier"], ["SHIPPED", "Expédiées"], ["DELIVERED", "Livrées"], ["PENDING_PAYMENT", "Non payées"], ["CANCELLED", "Annulées"], ["ALL", "Toutes"]];

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string; ok?: string }> }) {
  await requireSession("orders.manage");
  const { status = "PAID", ok } = await searchParams;
  const orders = await db.query.orders.findMany({
    where: status === "ALL" ? undefined : eq(t.orders.status, status),
    with: { user: true, items: { with: { product: true } } },
    orderBy: desc(t.orders.createdAt),
    limit: 100,
  });
  return (
    <div>
      <BackLink href="/dashboard/admin" label="Centre de contrôle" />
      <PageHeader title="Commandes" subtitle="Préparez, expédiez et suivez les commandes de la boutique" />
      <Flash text={ok} />
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map(([k, l]) => (
          <Link key={k} href={`?status=${k}`} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${status === k ? "bg-primary-400 text-white" : "bg-white text-slate-600 shadow-soft hover:bg-slate-50"}`}>{l}</Link>
        ))}
      </div>
      {orders.length === 0 ? <Empty>Aucune commande dans cette catégorie.</Empty> : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-primary-400">N° {o.id.slice(0, 8).toUpperCase()} · {o.user.firstName} {o.user.lastName}</p>
                  <p className="text-sm text-slate-500">{dateFr(o.createdAt, { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</p>
                  <p className="mt-1 flex flex-wrap gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1"><MapPin size={14} /> {o.shippingAddress}</span>
                    <a href={`tel:${o.phone}`} className="flex items-center gap-1 font-semibold text-primary-400 hover:underline"><Phone size={14} /> {o.phone}</a>
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={o.status} />
                  <p className="mt-1 text-lg font-bold text-primary-400">{xof(o.totalAmount)}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {o.items.map((i) => (
                  <span key={i.id} className="flex items-center gap-2 rounded-xl bg-slate-50 py-1.5 pl-1.5 pr-3 text-sm">
                    <img src={i.product.image ?? ""} alt="" className="h-9 w-9 rounded-lg object-cover" /> {i.quantity} × {i.product.name}
                  </span>
                ))}
              </div>
              <div className="mt-3 border-t border-slate-100 pt-3"><OrderStatus id={o.id} status={o.status} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
