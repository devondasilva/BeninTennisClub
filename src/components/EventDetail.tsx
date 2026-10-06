import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, count, eq, gte, ne } from "drizzle-orm";
import { ArrowLeft, CalendarDays, Clock, MapPin, Users, CheckCircle2, Ticket, ArrowRight } from "lucide-react";
import { db, t } from "@/db";
import { getSession } from "@/lib/auth";
import { dateFr, timeFr, xof } from "@/lib/format";
import ActionButton from "./ActionButton";
import AdSlot from "./AdSlot";
import { ProgressBar } from "./ui";

export const EVENT_TYPES: Record<string, [string, string]> = {
  TOURNAMENT: ["Tournoi", "bg-amber-100 text-amber-800"],
  STAGE: ["Stage", "bg-lime-100 text-lime-800"],
  SCHOOL: ["École de tennis", "bg-sky-100 text-sky-800"],
  GATHERING: ["Convivialité", "bg-pink-100 text-pink-800"],
};

/** Fiche détaillée d'un événement, partagée entre le site public et l'espace membre */
export default async function EventDetail({ id, base }: { id: string; base: "/evenements" | "/dashboard/events" }) {
  const e = await db.query.events.findFirst({ where: eq(t.events.id, id) });
  if (!e) notFound();
  const session = await getSession();
  const [[{ n }], mine, others] = await Promise.all([
    db.select({ n: count() }).from(t.eventRegistrations).where(and(eq(t.eventRegistrations.eventId, id), eq(t.eventRegistrations.status, "CONFIRMED"))),
    session ? db.query.eventRegistrations.findFirst({ where: and(eq(t.eventRegistrations.eventId, id), eq(t.eventRegistrations.userId, session.userId)) }) : null,
    db.query.events.findMany({ where: and(ne(t.events.id, id), gte(t.events.endDate, new Date())), orderBy: asc(t.events.startDate), limit: 3 }),
  ]);
  const left = Math.max(0, e.capacity - n);
  const past = e.endDate < new Date();
  const multiDay = e.endDate.toDateString() !== e.startDate.toDateString();
  const [type, color] = EVENT_TYPES[e.type] ?? [e.type, "bg-slate-100"];

  let cta: React.ReactNode;
  if (mine?.status === "CONFIRMED") cta = <p className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 font-semibold text-emerald-700"><CheckCircle2 size={18} /> Vous êtes inscrit(e)</p>;
  else if (e.status === "CANCELLED") cta = <p className="rounded-xl bg-red-50 py-3 text-center font-semibold text-red-700">Événement annulé</p>;
  else if (past) cta = <p className="rounded-xl bg-slate-100 py-3 text-center font-semibold text-slate-500">Événement terminé</p>;
  else if (left === 0) cta = <p className="rounded-xl bg-slate-100 py-3 text-center font-semibold text-slate-500">Complet</p>;
  else if (!session) cta = <Link href={`/login?next=${base}/${e.id}`} className="btn-accent w-full py-3 text-base"><Ticket size={18} /> Se connecter pour s'inscrire</Link>;
  else cta = <ActionButton url={`/api/events/${e.id}/register`} className="btn-accent py-3 text-base">{mine ? "Finaliser le paiement" : e.price ? `S'inscrire · ${xof(e.price)}` : "S'inscrire gratuitement"}</ActionButton>;

  return (
    <div className={base === "/evenements" ? "mx-auto max-w-7xl px-4 py-10 md:px-8" : ""}>
      <Link href={base} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary-400"><ArrowLeft size={16} /> Tous les événements</Link>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-3xl">
            <img src={e.image ?? ""} alt="" className="aspect-[2/1] w-full object-cover" />
            <span className={`chip absolute left-4 top-4 ${color}`}>{type}</span>
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-primary-400 md:text-4xl">{e.title}</h1>
          <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-slate-600">{e.description}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[[CalendarDays, "Date", multiDay ? `Du ${dateFr(e.startDate, { day: "numeric", month: "long" })} au ${dateFr(e.endDate, { day: "numeric", month: "long" })}` : dateFr(e.startDate, { weekday: "long", day: "numeric", month: "long" })],
              [Clock, "Horaires", `${timeFr(e.startDate)} – ${timeFr(e.endDate)}`],
              [MapPin, "Lieu", e.location]].map(([Icon, k, v]) => {
              const I = Icon as typeof Clock;
              return (
                <div key={k as string} className="rounded-2xl bg-slate-50 p-4">
                  <I size={18} className="text-accent-700" />
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{k as string}</p>
                  <p className="font-semibold text-primary-400">{v as string}</p>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
            <p className="text-sm text-slate-500">Participation</p>
            <p className="text-3xl font-extrabold text-primary-400">{e.price ? xof(e.price) : "Gratuit"}</p>
            <div className="mt-5">
              <div className="mb-1.5 flex justify-between text-sm"><span className="flex items-center gap-1.5 text-slate-600"><Users size={15} /> {n} inscrits</span><span className="font-semibold text-primary-400">{left} places restantes</span></div>
              <ProgressBar value={(n / e.capacity) * 100} />
            </div>
            <div className="mt-6">{cta}</div>
            <p className="mt-3 text-center text-xs text-slate-400">Paiement MTN Mobile Money ou carte · confirmation par e-mail</p>
          </div>
          <AdSlot placement="EVENTS" variant="compact" />
          {others.length > 0 && (
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="font-bold text-primary-400">Autres événements</p>
              <ul className="mt-3 space-y-2">
                {others.map((o) => (
                  <li key={o.id}>
                    <Link href={`${base}/${o.id}`} className="group flex items-center gap-3 rounded-xl p-1.5 hover:bg-white">
                      <img src={o.image ?? ""} alt="" className="h-12 w-20 rounded-lg object-cover" />
                      <span className="flex-1"><span className="block text-sm font-semibold text-primary-400 group-hover:underline">{o.title}</span><span className="text-xs text-slate-500">{dateFr(o.startDate, { day: "numeric", month: "long" })}</span></span>
                      <ArrowRight size={15} className="text-slate-400 transition group-hover:translate-x-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
