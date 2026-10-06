import Link from "next/link";
import { CalendarDays, Wallet, Bell, Trophy, Users, TrendingUp, Wrench, Plus, ShoppingBag, HeartHandshake, ArrowRight, Clock, MapPin } from "lucide-react";
import { db } from "@/db";
import { sortBy, startOfDay, startOfMonth, withReservationRefs } from "@/db/relations";
import { requireSession } from "@/lib/auth";
import { dateFr, timeFr, xof, relativeFr } from "@/lib/format";
import { StatCard, StatusBadge } from "@/components/ui";
import AdSlot from "@/components/AdSlot";
import { CardHead, MoreLink } from "./_member/ui";

export const metadata = { title: "Tableau de bord" };

const kicker = "mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-ink/45";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ refus?: string }> }) {
  const s = await requireSession();
  const { refus } = await searchParams;
  const now = new Date();
  const monthStart = startOfMonth(now);
  const todayStart = startOfDay(now);
  const todayEnd = new Date(todayStart.getTime() + 86400000);

  const upcoming = sortBy(
    withReservationRefs(db.reservations.filter((r) => r.userId === s.userId && r.startTime >= now && r.status !== "CANCELLED")),
    "startTime",
    "asc"
  ).slice(0, 4);
  const spent = db.transactions.sum("amount", (t) => t.userId === s.userId && t.status === "COMPLETED" && t.createdAt >= monthStart);
  const unread = db.notifications.count((n) => n.userId === s.userId && !n.read);
  const regCount = db.eventRegistrations.count((r) => r.userId === s.userId && r.status === "CONFIRMED");
  const notifs = sortBy(db.notifications.filter((n) => n.userId === s.userId), "createdAt", "desc").slice(0, 4);
  const nextEvents = sortBy(db.events.filter((e) => e.startDate >= now), "startDate", "asc").slice(0, 3);

  const staff = s.can("analytics.view");
  const club = staff
    ? {
        today: db.reservations.count((r) => r.startTime >= todayStart && r.startTime < todayEnd && r.status === "CONFIRMED"),
        revenue: db.transactions.sum("amount", (t) => t.status === "COMPLETED" && t.createdAt >= monthStart),
        members: db.users.count(),
        stringing: db.stringingRequests.count((r) => r.status === "PENDING" || r.status === "IN_PROGRESS"),
      }
    : null;

  const next = upcoming[0];

  return (
    <div className="space-y-8">
      {refus && (
        <p role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          Vous n'avez pas accès à cette page. Si vous en avez besoin, demandez à l'administrateur de vous donner l'accès correspondant.
        </p>
      )}

      {/* Bandeau d'accueil */}
      <section className="relative overflow-hidden rounded-[2rem] bg-ink p-6 text-white shadow-xl shadow-ink/20 sm:p-8 md:p-10">
        <div className="court-lines-dark pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <img src="/images/hero.svg" alt="" className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-20 md:block" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-lime/15 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 left-10 h-64 w-64 rounded-full bg-brand/40 blur-3xl" aria-hidden />

        <div className="relative grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-lime">
              <CalendarDays size={13} /> {dateFr(now, { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="mt-4 font-display text-4xl font-black leading-[1.05] tracking-tight text-white md:text-5xl">
              Bonjour <span className="text-lime">{s.firstName}</span>
            </h1>
            <p className="mt-3 max-w-xl text-white/75">
              {next
                ? `Prochaine partie : ${next.court.name}, ${dateFr(next.startTime, { weekday: "long", day: "numeric", month: "long" })} à ${timeFr(next.startTime)}.`
                : "Aucune réservation à venir. Et si vous tapiez quelques balles cette semaine ?"}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/dashboard/reservations/new" className="btn-accent"><Plus size={16} /> Réserver un court</Link>
              <Link href="/dashboard/shop" className="btn-ghost-dark"><ShoppingBag size={16} /> Boutique</Link>
              <Link href="/dashboard/fundraising" className="btn-ghost-dark"><HeartHandshake size={16} /> Collectes</Link>
            </div>
          </div>

          {next && (
            <div className="hidden w-72 rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur-xl lg:block">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-lime">Prochaine partie</p>
              <p className="mt-2 font-display text-2xl font-black tracking-tight">{next.court.name}</p>
              <div className="mt-3 space-y-1.5 text-sm text-white/75">
                <p className="flex items-center gap-2"><CalendarDays size={14} className="text-lime" /> <span className="capitalize">{dateFr(next.startTime, { weekday: "long", day: "numeric", month: "long" })}</span></p>
                <p className="flex items-center gap-2"><Clock size={14} className="text-lime" /> {timeFr(next.startTime)} – {timeFr(next.endTime)}</p>
                <p className="flex items-center gap-2"><MapPin size={14} className="text-lime" /> {next.court.surface}{next.coach && ` · avec ${next.coach.firstName}`}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {club && (
        <div>
          <h2 className={kicker}>Le club aujourd'hui</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Réservations du jour" value={String(club.today)} icon={CalendarDays} tone="navy" />
            <StatCard label="Chiffre d'affaires du mois" value={xof(club.revenue)} icon={TrendingUp} tone="lime" />
            <StatCard label="Membres inscrits" value={String(club.members)} icon={Users} tone="sky" />
            <StatCard label="Cordages en cours" value={String(club.stringing)} icon={Wrench} tone="clay" />
          </div>
        </div>
      )}

      <div>
        <h2 className={kicker}>Mon activité</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Réservations à venir" value={String(upcoming.length)} icon={CalendarDays} tone={club ? "sky" : "navy"} />
          <StatCard label="Dépensé ce mois-ci" value={xof(spent)} icon={Wallet} tone="lime" />
          <StatCard label="Événements inscrits" value={String(regCount)} icon={Trophy} tone="clay" />
          <StatCard label="Notifications non lues" value={String(unread)} icon={Bell} tone="sky" />
        </div>
      </div>

      <AdSlot placement="DASHBOARD" />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-6 md:p-8 lg:col-span-2">
          <CardHead title="Mes prochaines réservations" subtitle="Vos créneaux confirmés et à régler" icon={CalendarDays} action={<MoreLink href="/dashboard/reservations">Tout voir</MoreLink>} />
          {upcoming.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-ink/10 py-10 text-center">
              <p className="text-muted">Rien de prévu pour l'instant.</p>
              <Link href="/dashboard/reservations/new" className="btn-primary btn-sm mt-4"><Plus size={14} /> Réserver un court</Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink/[0.06] bg-mist/60 p-3 sm:flex-nowrap">
                  <img src={r.court.image ?? ""} alt="" className="h-14 w-20 shrink-0 rounded-xl object-cover sm:w-24" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-ink">{r.court.name} <span className="font-normal text-muted">· {r.court.surface}</span></p>
                    <p className="text-sm text-muted">
                      {dateFr(r.startTime, { weekday: "short", day: "numeric", month: "short" })} · {timeFr(r.startTime)} – {timeFr(r.endTime)}
                      {r.coach && ` · avec ${r.coach.firstName}`}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-6 md:p-8">
          <CardHead title="Notifications" icon={Bell} action={<MoreLink href="/dashboard/notifications">Tout voir</MoreLink>} />
          {notifs.length === 0 ? (
            <p className="py-8 text-center text-muted">Aucune notification.</p>
          ) : (
            <ul className="space-y-1">
              {notifs.map((n) => (
                <li key={n.id}>
                  <Link href={n.link ?? "/dashboard/notifications"} className="group -mx-2 flex gap-3 rounded-2xl p-2.5 transition hover:bg-mist">
                    <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${n.read ? "bg-cloud" : "bg-lime-dark ring-4 ring-lime-light"}`} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-ink group-hover:text-brand">{n.title}</p>
                      <p className="text-sm text-muted">{n.message}</p>
                      <p className="mt-0.5 text-xs text-ink/45">{relativeFr(n.createdAt)}</p>
                    </div>
                    <ArrowRight size={15} className="mt-1 shrink-0 text-ink/25 transition group-hover:translate-x-1 group-hover:text-brand" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Agenda du club</p>
            <h2 className="mt-1 font-display text-2xl font-black tracking-tight text-ink md:text-3xl">À ne pas <span className="text-brand">manquer</span></h2>
          </div>
          <Link href="/dashboard/events" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-brand hover:text-ink">Tous les événements <ArrowRight size={14} /></Link>
        </div>
        {nextEvents.length === 0 ? (
          <p className="card p-10 text-center text-muted">Aucun événement programmé pour le moment.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {nextEvents.map((e) => (
              <Link key={e.id} href={`/dashboard/events/${e.id}`} className="card-hover group overflow-hidden">
                <div className="overflow-hidden">
                  <img src={e.image ?? ""} alt="" className="aspect-[2/1] w-full object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">{dateFr(e.startDate)}</p>
                  <p className="mt-1 font-display text-lg font-black leading-snug tracking-tight text-ink">{e.title}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-brand">Voir le détail <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
