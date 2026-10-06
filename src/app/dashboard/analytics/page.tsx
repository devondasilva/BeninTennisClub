import { TrendingUp, CalendarDays, Users, ShoppingBag, Package, Trophy, Wrench, HeartHandshake } from "lucide-react";
import { db } from "@/db";
import { indexById } from "@/db/relations";
import { requireSession } from "@/lib/auth";
import { xof } from "@/lib/format";
import { PageHeader, StatCard } from "@/components/ui";
import { Panel, Pills } from "@/components/admin/kit";

export const metadata = { title: "Statistiques" };

const TYPE: Record<string, [string, string]> = {
  RESERVATION: ["Réservations", "#1F5996"], SHOP: ["Boutique", "#B9BE2C"], DONATION: ["Dons", "#E39B1B"], EVENT: ["Événements", "#6F9BCF"], STRINGING: ["Cordage", "#0B2440"],
};
const ORDER = ["RESERVATION", "SHOP", "EVENT", "STRINGING", "DONATION"];
const PERIODS = [["7", "7 j"], ["30", "30 j"], ["90", "90 j"], ["365", "12 mois"]] as const;
const DAY = 86400000;

const pad = (n: number) => String(n).padStart(2, "0");
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const monthKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
const compact = (v: number) => (v >= 1e6 ? `${(v / 1e6).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M` : v >= 1e3 ? `${Math.round(v / 1e3).toLocaleString("fr-FR")} k` : String(Math.round(v)));

/** Écart en % avec la période précédente, pour l'indice des cartes */
function delta(cur: number, prev: number) {
  if (!prev) return cur ? "Nouveau · vs période préc." : "Stable · vs période préc.";
  const p = Math.round(((cur - prev) / prev) * 1000) / 10;
  if (p > 500) return "Forte hausse · vs période préc.";
  return `${p > 0 ? "+" : ""}${p.toLocaleString("fr-FR")} % vs période préc.`;
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  await requireSession("analytics.view");
  const { p } = await searchParams;
  const days = PERIODS.some(([k]) => k === p) ? Number(p) : 30;
  const now = Date.now();
  const since = new Date(now - days * DAY);
  const prevSince = new Date(now - 2 * days * DAY);
  const monthly = days > 90;

  const done = db.transactions.filter((t) => t.status === "COMPLETED");
  const tx = done.filter((t) => t.createdAt >= since);
  const prevTx = done.filter((t) => t.createdAt >= prevSince && t.createdAt < since);
  const rev = tx.reduce((a, t) => a + t.amount, 0);
  const prevRev = prevTx.reduce((a, t) => a + t.amount, 0);

  const resIn = (from: Date, to: Date) => db.reservations.count((r) => r.status === "CONFIRMED" && r.startTime >= from && r.startTime < to);
  const res = db.reservations.count((r) => r.status === "CONFIRMED" && r.startTime >= since);
  const prevRes = resIn(prevSince, since);
  const newMembers = db.users.count((u) => u.createdAt >= since);
  const prevMembers = db.users.count((u) => u.createdAt >= prevSince && u.createdAt < since);
  const shop = tx.filter((t) => t.type === "SHOP").reduce((a, t) => a + t.amount, 0);
  const prevShop = prevTx.filter((t) => t.type === "SHOP").reduce((a, t) => a + t.amount, 0);

  // Série (jours ou mois sans recette = 0), empilée par activité
  const buckets = monthly
    ? Array.from({ length: 12 }, (_, i) => {
        const d = new Date(new Date().getFullYear(), new Date().getMonth() - (11 - i), 1);
        return { key: monthKey(d), label: d.toLocaleDateString("fr-FR", { month: "short" }), long: d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) };
      })
    : Array.from({ length: days }, (_, i) => {
        const d = new Date(now - (days - 1 - i) * DAY);
        return { key: dayKey(d), label: d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }), long: d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) };
      });
  const series = new Map(buckets.map((b) => [b.key, {} as Record<string, number>]));
  for (const t of tx) {
    const s = series.get(monthly ? monthKey(t.createdAt) : dayKey(t.createdAt));
    if (s) s[t.type] = (s[t.type] ?? 0) + t.amount;
  }
  const bars = buckets.map((b) => {
    const parts = series.get(b.key)!;
    return { ...b, parts, v: Object.values(parts).reduce((a, n) => a + n, 0) };
  });
  const rawMax = Math.max(...bars.map((b) => b.v), 1);
  const step = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const max = Math.ceil(rawMax / step) * step;
  const best = bars.reduce((a, b) => (b.v > a.v ? b : a), bars[0]);
  const labelEvery = Math.ceil(bars.length / 8);

  // Répartition par activité
  const byType = ORDER.map((type) => ({ type, v: tx.filter((t) => t.type === type).reduce((a, t) => a + t.amount, 0) }))
    .concat([...new Set(tx.map((t) => t.type))].filter((t) => !ORDER.includes(t)).map((type) => ({ type, v: tx.filter((t) => t.type === type).reduce((a, t) => a + t.amount, 0) })))
    .filter((x) => x.v > 0)
    .sort((a, b) => b.v - a.v);
  const typeTotal = byType.reduce((s, x) => s + x.v, 0) || 1;
  let acc = 0;
  const arcs = byType.map((x) => {
    const start = acc / typeTotal, end = (acc + x.v) / typeTotal;
    acc += x.v;
    if (end - start >= 0.9999) return { ...x, d: "", full: true };
    const a0 = start * 2 * Math.PI - Math.PI / 2, a1 = end * 2 * Math.PI - Math.PI / 2;
    const large = end - start > 0.5 ? 1 : 0;
    const pt = (a: number, r: number) => `${60 + r * Math.cos(a)} ${60 + r * Math.sin(a)}`;
    return { ...x, full: false, d: `M ${pt(a0, 54)} A 54 54 0 ${large} 1 ${pt(a1, 54)} L ${pt(a1, 34)} A 34 34 0 ${large} 0 ${pt(a0, 34)} Z` };
  });

  // Occupation des courts (créneaux confirmés déjà joués sur la période)
  const courts = db.courts.all();
  const occupancy = new Map<string, number>();
  for (const r of db.reservations.filter((r) => r.status === "CONFIRMED" && r.startTime >= since && r.startTime.getTime() < now)) {
    occupancy.set(r.courtId, (occupancy.get(r.courtId) ?? 0) + (r.endTime.getTime() - r.startTime.getTime()) / 60000);
  }
  const openMinutes = days * 18 * 60;

  // Meilleures ventes (depuis l'ouverture)
  const products = indexById(db.products.all());
  const sales = new Map<string, { qty: number; v: number }>();
  for (const i of db.orderItems.all()) {
    if (!products.has(i.productId)) continue;
    const x = sales.get(i.productId) ?? { qty: 0, v: 0 };
    x.qty += i.quantity; x.v += i.quantity * i.price;
    sales.set(i.productId, x);
  }
  const topProducts = [...sales.entries()].sort((a, b) => b[1].v - a[1].v).slice(0, 5).map(([id, x]) => ({ ...products.get(id)!, ...x }));
  const topMax = Math.max(...topProducts.map((t) => t.v), 1);

  // Activité de la période
  const activity = [
    { label: "Commandes boutique", value: db.orders.count((o) => o.createdAt >= since && o.status !== "PENDING_PAYMENT" && o.status !== "CANCELLED"), icon: Package },
    { label: "Inscriptions événements", value: db.eventRegistrations.count((r) => r.createdAt >= since && r.status === "CONFIRMED"), icon: Trophy },
    { label: "Raquettes cordées", value: db.stringingRequests.count((r) => r.createdAt >= since && r.status !== "PENDING_PAYMENT"), icon: Wrench },
    { label: "Dons reçus", value: db.donations.count((d) => d.createdAt >= since && d.status === "COMPLETED"), icon: HeartHandshake },
  ];

  const periodText = monthly ? "Les 12 derniers mois" : `Les ${days} derniers jours`;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Back-office · Pilotage" title="Statistiques" subtitle={periodText}
        action={<Pills label="Période" items={PERIODS.map(([k, l]) => ({ href: `?p=${k}`, label: l, active: String(days) === k }))} />} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Chiffre d'affaires" value={xof(rev)} icon={TrendingUp} tone="navy" hint={delta(rev, prevRev)} />
        <StatCard label="Réservations" value={String(res)} icon={CalendarDays} tone="lime" hint={delta(res, prevRes)} />
        <StatCard label="Nouveaux membres" value={String(newMembers)} icon={Users} tone="sky" hint={delta(newMembers, prevMembers)} />
        <StatCard label="Ventes boutique" value={xof(shop)} icon={ShoppingBag} tone="clay" hint={delta(shop, prevShop)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title={monthly ? "Recettes par mois" : "Recettes par jour"} subtitle={`${periodText} · paiements encaissés`}>
          <div className="mb-5 flex flex-wrap gap-2">
            {ORDER.filter((k) => byType.some((x) => x.type === k)).map((k) => (
              <span key={k} className="inline-flex items-center gap-2 rounded-full border border-ink/[0.08] px-3 py-1 text-xs">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: TYPE[k][1] }} aria-hidden />
                <span className="font-semibold text-ink">{TYPE[k][0]}</span>
                <span className="tabular text-muted">{xof(byType.find((x) => x.type === k)?.v ?? 0)}</span>
              </span>
            ))}
          </div>
          <div className="flex gap-3" role="img" aria-label={`Recettes ${periodText.toLowerCase()} : ${xof(rev)} au total${best.v ? `, record le ${best.long} avec ${xof(best.v)}` : ""}.`}>
            <div className="flex h-60 w-10 shrink-0 flex-col justify-between text-right text-[10px] text-ink/45 tabular" aria-hidden>
              {[4, 3, 2, 1, 0].map((i) => <span key={i} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">{compact((max * i) / 4)}</span>)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="relative h-60">
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between" aria-hidden>
                  {[0, 1, 2, 3, 4].map((i) => <span key={i} className={`block border-t ${i === 4 ? "border-ink/15" : "border-dashed border-ink/[0.08]"}`} />)}
                </div>
                <div className={`relative flex h-full items-end ${bars.length > 40 ? "gap-px" : "gap-1"}`}>
                  {bars.map((b) => (
                    <div key={b.key} className="group relative flex h-full flex-1 flex-col justify-end">
                      <div className="flex flex-col-reverse overflow-hidden rounded-t-md transition group-hover:opacity-80" style={{ height: `${(b.v / max) * 100}%`, minHeight: b.v ? 3 : 0 }}>
                        {ORDER.concat(Object.keys(b.parts).filter((k) => !ORDER.includes(k))).filter((k) => b.parts[k]).map((k) => (
                          <span key={k} className="block w-full" style={{ height: `${(b.parts[k] / b.v) * 100}%`, background: TYPE[k]?.[1] ?? "#94a3b8" }} />
                        ))}
                      </div>
                      <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-xl bg-ink px-3 py-2 text-xs text-white shadow-lg group-hover:block">
                        <span className="block text-[10px] uppercase tracking-wider text-white/60">{b.long}</span>
                        <span className="tabular font-bold">{xof(b.v)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`mt-2 flex text-[10px] text-ink/45 ${bars.length > 40 ? "gap-px" : "gap-1"}`} aria-hidden>
                {bars.map((b, i) => <span key={b.key} className="flex-1 overflow-visible whitespace-nowrap text-center">{i % labelEvery === 0 ? b.label : ""}</span>)}
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Répartition des recettes" subtitle="Part de chaque activité">
          {byType.length === 0 ? <p className="py-10 text-center text-sm text-muted">Aucune recette sur la période.</p> : (
            <>
              <div className="relative mx-auto h-48 w-48">
                <svg viewBox="0 0 120 120" className="h-full w-full" role="img" aria-label="Répartition des recettes par activité">
                  {arcs.map((a) => a.full
                    ? <circle key={a.type} cx="60" cy="60" r="44" fill="none" stroke={TYPE[a.type]?.[1] ?? "#94a3b8"} strokeWidth="20" />
                    : <path key={a.type} d={a.d} fill={TYPE[a.type]?.[1] ?? "#94a3b8"} stroke="#fff" strokeWidth="1" />)}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/45">Total</span>
                  <span className="tabular text-xl font-extrabold text-ink">{compact(rev)}</span>
                  <span className="text-[10px] font-semibold text-muted">XOF</span>
                </div>
              </div>
              <ul className="mt-6 space-y-2.5 text-sm">
                {arcs.map((a) => (
                  <li key={a.type} className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded" style={{ background: TYPE[a.type]?.[1] ?? "#94a3b8" }} aria-hidden />
                    <span className="flex-1 text-ink">{TYPE[a.type]?.[0] ?? a.type}</span>
                    <span className="tabular text-xs text-muted">{xof(a.v)}</span>
                    <span className="tabular w-12 text-right font-bold text-ink">{Math.round((a.v / typeTotal) * 100)} %</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {activity.map((k) => (
          <div key={k.label} className="flex items-center gap-4 rounded-[1.75rem] border border-ink/[0.08] bg-white p-5 shadow-sm">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mist text-ink"><k.icon size={19} /></span>
            <div>
              <p className="text-xs text-muted">{k.label}</p>
              <p className="tabular text-xl font-extrabold text-ink">{k.value.toLocaleString("fr-FR")}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Taux d'occupation des courts" subtitle="Base : 18 h d'ouverture par jour.">
          <div className="space-y-5">
            {courts.map((c) => {
              const pct = ((occupancy.get(c.id) ?? 0) / openMinutes) * 100;
              return (
                <div key={c.id}>
                  <div className="flex items-center gap-3">
                    <img src={c.image ?? "/images/courts/court-1.svg"} alt="" className="h-10 w-16 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-ink">{c.name}</p><p className="text-xs text-muted">{c.surface}</p></div>
                    <span className="tabular font-bold text-ink">{pct.toFixed(0)} %</span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-cloud"><div className="h-full rounded-full bg-gradient-to-r from-brand to-lime-dark" style={{ width: `${Math.min(100, pct)}%` }} /></div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Meilleures ventes" subtitle="Boutique · depuis l'ouverture">
          {topProducts.length === 0 ? <p className="py-10 text-center text-sm text-muted">Aucune vente pour l'instant.</p> : (
            <ol className="space-y-4">
              {topProducts.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? "bg-ink text-lime" : "bg-mist text-ink/60"}`}>{i + 1}</span>
                  <img src={p.image ?? "/images/logo.svg"} alt="" className="h-11 w-11 rounded-xl bg-mist object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                      <span className="tabular shrink-0 text-sm font-semibold text-ink">{xof(p.v)}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-cloud"><div className="h-full rounded-full bg-brand" style={{ width: `${(p.v / topMax) * 100}%` }} /></div>
                      <span className="tabular shrink-0 text-xs text-muted">{p.qty} vendus</span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>
    </div>
  );
}
