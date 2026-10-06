import Link from "next/link";
import { and, asc, count, desc, eq, gte, lt, ne, sql } from "drizzle-orm";
import { CalendarDays, Wallet, Bell, Trophy, Users, TrendingUp, Wrench, Plus, ShoppingBag, HeartHandshake, ArrowRight } from "lucide-react";
import { db, t } from "@/db";
import { requireSession } from "@/lib/auth";
import { dateFr, timeFr, xof, relativeFr } from "@/lib/format";
import { StatCard, StatusBadge } from "@/components/ui";
import AdSlot from "@/components/AdSlot";

export const metadata = { title: "Tableau de bord" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ refus?: string }> }) {
  const s = await requireSession();
  const { refus } = await searchParams;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000);

  const [upcoming, [spent], [unread], [regCount], notifs, nextEvents] = await Promise.all([
    db.query.reservations.findMany({
      where: and(eq(t.reservations.userId, s.userId), gte(t.reservations.startTime, now), ne(t.reservations.status, "CANCELLED")),
      with: { court: true, coach: true },
      orderBy: asc(t.reservations.startTime),
      limit: 4,
    }),
    db.select({ v: sql<number>`coalesce(sum(${t.transactions.amount}),0)` }).from(t.transactions)
      .where(and(eq(t.transactions.userId, s.userId), eq(t.transactions.status, "COMPLETED"), gte(t.transactions.createdAt, monthStart))),
    db.select({ n: count() }).from(t.notifications).where(and(eq(t.notifications.userId, s.userId), eq(t.notifications.read, false))),
    db.select({ n: count() }).from(t.eventRegistrations).where(and(eq(t.eventRegistrations.userId, s.userId), eq(t.eventRegistrations.status, "CONFIRMED"))),
    db.query.notifications.findMany({ where: eq(t.notifications.userId, s.userId), orderBy: desc(t.notifications.createdAt), limit: 4 }),
    db.query.events.findMany({ where: gte(t.events.startDate, now), orderBy: asc(t.events.startDate), limit: 3 }),
  ]);

  const staff = s.can("analytics.view");
  const club = staff
    ? await Promise.all([
        db.select({ n: count() }).from(t.reservations).where(and(gte(t.reservations.startTime, todayStart), lt(t.reservations.startTime, todayEnd), eq(t.reservations.status, "CONFIRMED"))),
        db.select({ v: sql<number>`coalesce(sum(${t.transactions.amount}),0)` }).from(t.transactions).where(and(eq(t.transactions.status, "COMPLETED"), gte(t.transactions.createdAt, monthStart))),
        db.select({ n: count() }).from(t.users),
        db.select({ n: count() }).from(t.stringingRequests).where(sql`${t.stringingRequests.status} in ('PENDING','IN_PROGRESS')`),
      ])
    : null;

  return (
    <div className="space-y-8">
      {refus && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Vous n'avez pas accès à cette page. Si vous en avez besoin, demandez à l'administrateur de vous donner l'accès correspondant.
        </p>
      )}
      {/* Bandeau d'accueil */}
      <div className="relative overflow-hidden rounded-3xl bg-primary-400 p-6 text-white md:p-8">
        <img src="/images/hero.svg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="relative">
          <p className="text-accent-400">{dateFr(now, { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1 className="mt-1 text-3xl font-bold">Bonjour {s.firstName} 👋</h1>
          <p className="mt-2 max-w-lg text-slate-200">
            {upcoming[0]
              ? `Prochaine partie : ${upcoming[0].court.name}, ${dateFr(upcoming[0].startTime, { weekday: "long", day: "numeric", month: "long" })} à ${timeFr(upcoming[0].startTime)}.`
              : "Aucune réservation à venir. Et si vous tapiez quelques balles cette semaine ?"}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/dashboard/reservations/new" className="btn-accent"><Plus size={16} /> Réserver un court</Link>
            <Link href="/dashboard/shop" className="btn bg-white/15 text-white hover:bg-white/25"><ShoppingBag size={16} /> Boutique</Link>
            <Link href="/dashboard/fundraising" className="btn bg-white/15 text-white hover:bg-white/25"><HeartHandshake size={16} /> Collectes</Link>
          </div>
        </div>
      </div>

      {club && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Le club aujourd'hui</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Réservations du jour" value={String(club[0][0].n)} icon={CalendarDays} tone="navy" />
            <StatCard label="Chiffre d'affaires du mois" value={xof(club[1][0].v)} icon={TrendingUp} tone="lime" />
            <StatCard label="Membres inscrits" value={String(club[2][0].n)} icon={Users} tone="sky" />
            <StatCard label="Cordages en cours" value={String(club[3][0].n)} icon={Wrench} tone="clay" />
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Mon activité</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Réservations à venir" value={String(upcoming.length)} icon={CalendarDays} tone="navy" />
          <StatCard label="Dépensé ce mois-ci" value={xof(spent.v)} icon={Wallet} tone="lime" />
          <StatCard label="Événements inscrits" value={String(regCount.n)} icon={Trophy} tone="clay" />
          <StatCard label="Notifications non lues" value={String(unread.n)} icon={Bell} tone="sky" />
        </div>
      </div>

      <AdSlot placement="DASHBOARD" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary-400">Mes prochaines réservations</h2>
            <Link href="/dashboard/reservations" className="text-sm font-semibold text-primary-400 hover:underline">Tout voir</Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="py-8 text-center text-slate-500">Rien de prévu pour l'instant.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcoming.map((r) => (
                <li key={r.id} className="flex items-center gap-4 py-3">
                  <img src={r.court.image ?? ""} alt="" className="h-14 w-24 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-primary-400">{r.court.name} <span className="font-normal text-slate-400">· {r.court.surface}</span></p>
                    <p className="text-sm text-slate-500">
                      {dateFr(r.startTime, { weekday: "short", day: "numeric", month: "short" })} · {timeFr(r.startTime)} – {timeFr(r.endTime)}
                      {r.coach && ` · avec ${r.coach.firstName}`}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary-400">Notifications</h2>
            <Link href="/dashboard/notifications" className="text-sm font-semibold text-primary-400 hover:underline">Tout voir</Link>
          </div>
          <ul className="space-y-3">
            {notifs.map((n) => (
              <li key={n.id}>
                <Link href={n.link ?? "/dashboard/notifications"} className="group -mx-2 flex gap-3 rounded-xl p-2 transition hover:bg-slate-50">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-slate-200" : "bg-accent-500"}`} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-primary-400">{n.title}</p>
                    <p className="text-sm text-slate-500">{n.message}</p>
                    <p className="text-xs text-slate-400">{relativeFr(n.createdAt)}</p>
                  </div>
                  <ArrowRight size={15} className="mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary-400" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary-400">À ne pas manquer</h2>
          <Link href="/dashboard/events" className="flex items-center gap-1 text-sm font-semibold text-primary-400 hover:underline">Tous les événements <ArrowRight size={14} /></Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {nextEvents.map((e) => (
            <Link key={e.id} href={`/dashboard/events/${e.id}`} className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-medium">
              <img src={e.image ?? ""} alt="" className="aspect-[2/1] w-full object-cover" />
              <div className="p-4">
                <p className="text-xs font-semibold uppercase text-accent-700">{dateFr(e.startDate)}</p>
                <p className="font-bold text-primary-400 group-hover:underline">{e.title}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary-400">Voir le détail <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
