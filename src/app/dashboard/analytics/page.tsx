import { and, eq, gte, sql } from "drizzle-orm";
import { TrendingUp, CalendarDays, Users, ShoppingBag } from "lucide-react";
import { db, t } from "@/db";
import { requireSession } from "@/lib/auth";
import { xof } from "@/lib/format";
import { PageHeader, StatCard } from "@/components/ui";

export const metadata = { title: "Statistiques" };

const TYPE: Record<string, [string, string]> = {
  RESERVATION: ["Réservations", "#1e3a5f"], SHOP: ["Boutique", "#c8d965"], DONATION: ["Dons", "#f59e0b"], EVENT: ["Événements", "#38bdf8"], STRINGING: ["Cordage", "#d9733f"],
};

export default async function AnalyticsPage() {
  await requireSession("analytics.view");
  const since = new Date(Date.now() - 30 * 86400000);
  const done = eq(t.transactions.status, "COMPLETED");

  const [byDay, byType, [rev30], [res30], courts, occupancy, topProducts, [newMembers]] = await Promise.all([
    db.select({ d: sql<string>`strftime('%Y-%m-%d', ${t.transactions.createdAt} / 1000, 'unixepoch', 'localtime')`, v: sql<number>`sum(${t.transactions.amount})` })
      .from(t.transactions).where(and(done, gte(t.transactions.createdAt, since))).groupBy(sql`1`).orderBy(sql`1`),
    db.select({ type: t.transactions.type, v: sql<number>`sum(${t.transactions.amount})` }).from(t.transactions).where(and(done, gte(t.transactions.createdAt, since))).groupBy(t.transactions.type),
    db.select({ v: sql<number>`coalesce(sum(${t.transactions.amount}),0)` }).from(t.transactions).where(and(done, gte(t.transactions.createdAt, since))),
    db.select({ n: sql<number>`count(*)` }).from(t.reservations).where(and(eq(t.reservations.status, "CONFIRMED"), gte(t.reservations.startTime, since))),
    db.query.courts.findMany(),
    db.select({ courtId: t.reservations.courtId, minutes: sql<number>`sum((${t.reservations.endTime} - ${t.reservations.startTime}) / 60000)` })
      .from(t.reservations).where(and(eq(t.reservations.status, "CONFIRMED"), gte(t.reservations.startTime, since), sql`${t.reservations.startTime} < ${Date.now()}`)).groupBy(t.reservations.courtId),
    db.select({ name: t.products.name, image: t.products.image, qty: sql<number>`sum(${t.orderItems.quantity})`, v: sql<number>`sum(${t.orderItems.quantity} * ${t.orderItems.price})` })
      .from(t.orderItems).innerJoin(t.products, eq(t.orderItems.productId, t.products.id)).groupBy(t.products.id).orderBy(sql`4 desc`).limit(5),
    db.select({ n: sql<number>`count(*)` }).from(t.users).where(gte(t.users.createdAt, since)),
  ]);

  // Série des 30 derniers jours (jours sans recette = 0)
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86400000);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { key, label: d.getDate(), v: byDay.find((x) => x.d === key)?.v ?? 0 };
  });
  const max = Math.max(...days.map((d) => d.v), 1);
  const typeTotal = byType.reduce((s, x) => s + x.v, 0) || 1;
  const openMinutes = 30 * 18 * 60;

  // Donut
  let acc = 0;
  const arcs = byType.sort((a, b) => b.v - a.v).map((x) => {
    const start = acc / typeTotal, end = (acc + x.v) / typeTotal;
    acc += x.v;
    const a0 = start * 2 * Math.PI - Math.PI / 2, a1 = end * 2 * Math.PI - Math.PI / 2;
    const large = end - start > 0.5 ? 1 : 0;
    const p = (a: number, r: number) => `${60 + r * Math.cos(a)} ${60 + r * Math.sin(a)}`;
    return { ...x, d: `M ${p(a0, 54)} A 54 54 0 ${large} 1 ${p(a1, 54)} L ${p(a1, 34)} A 34 34 0 ${large} 0 ${p(a0, 34)} Z` };
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Statistiques" subtitle="Les 30 derniers jours" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Chiffre d'affaires" value={xof(rev30.v)} icon={TrendingUp} tone="navy" />
        <StatCard label="Réservations" value={String(res30.n)} icon={CalendarDays} tone="lime" />
        <StatCard label="Nouveaux membres" value={String(newMembers.n)} icon={Users} tone="sky" />
        <StatCard label="Ventes boutique" value={xof(byType.find((x) => x.type === "SHOP")?.v ?? 0)} icon={ShoppingBag} tone="clay" />
      </div>

      <div className="card p-6">
        <h2 className="mb-6 font-bold text-primary-400">Recettes par jour</h2>
        <div className="flex h-56 items-end gap-1">
          {days.map((d) => (
            <div key={d.key} className="group relative flex h-full flex-1 flex-col justify-end">
              <div className="rounded-t-md bg-primary-400 transition group-hover:bg-accent-500" style={{ height: `${(d.v / max) * 100}%`, minHeight: d.v ? 4 : 0 }} />
              <span className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white group-hover:block">{xof(d.v)}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-1 text-[10px] text-slate-400">
          {days.map((d, i) => <span key={d.key} className="flex-1 text-center">{i % 3 === 0 ? d.label : ""}</span>)}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <h2 className="mb-4 font-bold text-primary-400">Répartition des recettes</h2>
          <svg viewBox="0 0 120 120" className="mx-auto h-44 w-44">
            {arcs.map((a) => <path key={a.type} d={a.d} fill={TYPE[a.type]?.[1] ?? "#94a3b8"} />)}
          </svg>
          <ul className="mt-4 space-y-2 text-sm">
            {arcs.map((a) => (
              <li key={a.type} className="flex items-center gap-2">
                <span className="h-3 w-3 rounded" style={{ background: TYPE[a.type]?.[1] }} />
                <span className="flex-1">{TYPE[a.type]?.[0] ?? a.type}</span>
                <span className="font-semibold">{Math.round((a.v / typeTotal) * 100)} %</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 font-bold text-primary-400">Taux d'occupation des courts</h2>
          <div className="space-y-5">
            {courts.map((c) => {
              const pct = ((occupancy.find((o) => o.courtId === c.id)?.minutes ?? 0) / openMinutes) * 100;
              return (
                <div key={c.id}>
                  <div className="flex items-center gap-3">
                    <img src={c.image ?? ""} alt="" className="h-10 w-16 rounded-md object-cover" />
                    <div className="flex-1"><p className="text-sm font-semibold">{c.name}</p><p className="text-xs text-slate-400">{c.surface}</p></div>
                    <span className="font-bold text-primary-400">{pct.toFixed(0)} %</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-accent-500" style={{ width: `${Math.min(100, pct)}%` }} /></div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-slate-400">Base : 18 h d'ouverture par jour.</p>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 font-bold text-primary-400">Meilleures ventes</h2>
          <ul className="space-y-3">
            {topProducts.map((p, i) => (
              <li key={p.name} className="flex items-center gap-3">
                <span className="w-4 text-sm font-bold text-slate-400">{i + 1}</span>
                <img src={p.image ?? ""} alt="" className="h-10 w-10 rounded-lg object-cover" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{p.name}</p><p className="text-xs text-slate-400">{p.qty} vendus</p></div>
                <span className="text-sm font-semibold">{xof(p.v)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
