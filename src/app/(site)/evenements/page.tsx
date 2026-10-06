import Link from "next/link";
import { and, asc, count, eq, gte } from "drizzle-orm";
import { CalendarDays, MapPin, Users, ArrowRight } from "lucide-react";
import { db, t } from "@/db";
import { dateFr, timeFr, xof } from "@/lib/format";
import PageHero from "@/components/site/PageHero";
import AdSlot from "@/components/AdSlot";

export const metadata = { title: "Événements" };

const TYPES: Record<string, string> = { TOURNAMENT: "Tournoi", STAGE: "Stage", SCHOOL: "École de tennis", GATHERING: "Convivialité" };

export default async function PublicEventsPage() {
  const events = await db.query.events.findMany({ where: and(gte(t.events.endDate, new Date()), eq(t.events.status, "ACTIVE")), orderBy: asc(t.events.startDate) });
  const counts = await db.select({ eventId: t.eventRegistrations.eventId, n: count() }).from(t.eventRegistrations)
    .where(eq(t.eventRegistrations.status, "CONFIRMED")).groupBy(t.eventRegistrations.eventId);
  const [first, ...rest] = events;

  return (
    <>
      <PageHero kicker="Agenda du club" title="Tournois, stages & soirées" text="Inscrivez-vous en ligne en quelques clics, paiement MTN Mobile Money ou carte." image="/images/events/tournament.svg" />
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        {first && (
          <div className="grid overflow-hidden rounded-3xl bg-primary-400 md:grid-cols-2">
            <Link href={`/evenements/${first.id}`}><img src={first.image ?? ""} alt={first.title} className="h-full min-h-[260px] w-full object-cover transition hover:opacity-90" /></Link>
            <div className="p-8 md:p-10">
              <span className="chip bg-accent-400 text-primary-400">À la une · {TYPES[first.type]}</span>
              <h2 className="mt-4 text-3xl font-bold text-white">{first.title}</h2>
              <p className="mt-3 text-slate-300">{first.description}</p>
              <div className="mt-5 space-y-1.5 text-sm text-slate-300">
                <p className="flex items-center gap-2"><CalendarDays size={16} className="text-accent-400" /> {dateFr(first.startDate, { weekday: "long", day: "numeric", month: "long" })} · {timeFr(first.startDate)}</p>
                <p className="flex items-center gap-2"><MapPin size={16} className="text-accent-400" /> {first.location}</p>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={`/evenements/${first.id}`} className="btn-accent">Voir le détail et s'inscrire <ArrowRight size={16} /></Link>
                <span className="self-center font-semibold text-white">{first.price ? xof(first.price) : "Gratuit"}</span>
              </div>
            </div>
          </div>
        )}
        <AdSlot placement="EVENTS" className="mt-10" />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((e) => {
            const n = counts.find((c) => c.eventId === e.id)?.n ?? 0;
            return (
              <div key={e.id} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 shadow-soft transition hover:shadow-medium">
                <Link href={`/evenements/${e.id}`}><img src={e.image ?? ""} alt={e.title} className="aspect-[2/1] w-full object-cover transition hover:opacity-90" /></Link>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-accent-700">{TYPES[e.type]} · {dateFr(e.startDate, { day: "numeric", month: "long" })}</p>
                  <Link href={`/evenements/${e.id}`} className="mt-1 text-lg font-bold text-primary-400 hover:underline">{e.title}</Link>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">{e.description}</p>
                  <p className="mt-3 flex items-center gap-2 text-sm text-slate-500"><Users size={15} /> {e.capacity - n} places restantes</p>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="font-bold text-primary-400">{e.price ? xof(e.price) : "Gratuit"}</span>
                    <Link href={`/evenements/${e.id}`} className="btn-accent px-4 py-2">Voir le détail <ArrowRight size={15} /></Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
