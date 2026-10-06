import Link from "next/link";
import { and, asc, count, eq, gte, lt } from "drizzle-orm";
import { CalendarDays, MapPin, Users, Plus, CheckCircle2 } from "lucide-react";
import { db, t } from "@/db";
import { requireSession } from "@/lib/auth";
import { dateFr, timeFr, xof } from "@/lib/format";
import { Empty, PageHeader } from "@/components/ui";
import ActionButton from "@/components/ActionButton";
import AdSlot from "@/components/AdSlot";
import ExpandableText from "@/components/ExpandableText";

export const metadata = { title: "Événements" };

const TYPES: Record<string, [string, string]> = {
  TOURNAMENT: ["Tournoi", "bg-amber-100 text-amber-800"],
  STAGE: ["Stage", "bg-lime-100 text-lime-800"],
  SCHOOL: ["École de tennis", "bg-sky-100 text-sky-800"],
  GATHERING: ["Convivialité", "bg-pink-100 text-pink-800"],
};

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ type?: string; past?: string }> }) {
  const s = await requireSession();
  const { type, past } = await searchParams;
  const now = new Date();
  const events = await db.query.events.findMany({
    where: and(eq(t.events.status, "ACTIVE"), type ? eq(t.events.type, type) : undefined, past ? lt(t.events.endDate, now) : gte(t.events.endDate, now)),
    orderBy: asc(t.events.startDate),
  });
  const counts = await db.select({ eventId: t.eventRegistrations.eventId, n: count() }).from(t.eventRegistrations)
    .where(eq(t.eventRegistrations.status, "CONFIRMED")).groupBy(t.eventRegistrations.eventId);
  const mine = await db.query.eventRegistrations.findMany({ where: eq(t.eventRegistrations.userId, s.userId) });
  const countOf = (id: string) => counts.find((c) => c.eventId === id)?.n ?? 0;
  const myStatus = (id: string) => mine.find((m) => m.eventId === id)?.status;

  const filters = [["", "Tous"], ["TOURNAMENT", "Tournois"], ["STAGE", "Stages"], ["SCHOOL", "École"], ["GATHERING", "Convivialité"]];

  return (
    <div>
      <PageHeader title="Événements" subtitle="Tournois, stages, école de tennis et soirées du club"
        action={s.can("events.manage") && <Link href="/dashboard/events/new" className="btn-accent"><Plus size={16} /> Créer un événement</Link>} />

      <AdSlot placement="EVENTS" className="mb-6" />
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map(([k, l]) => (
          <Link key={k} href={k ? `?type=${k}` : "?"} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${(type ?? "") === k && !past ? "bg-primary-400 text-white" : "bg-white text-slate-600 shadow-soft hover:bg-slate-50"}`}>{l}</Link>
        ))}
        <Link href="?past=1" className={`rounded-full px-4 py-1.5 text-sm font-semibold ${past ? "bg-primary-400 text-white" : "bg-white text-slate-600 shadow-soft"}`}>Passés</Link>
      </div>

      {events.length === 0 ? <Empty>Aucun événement dans cette catégorie.</Empty> : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.map((e) => {
            const n = countOf(e.id), left = e.capacity - n, status = myStatus(e.id);
            const [label, color] = TYPES[e.type] ?? [e.type, "bg-slate-100"];
            return (
              <div key={e.id} className="card flex flex-col overflow-hidden">
                <Link href={`/dashboard/events/${e.id}`} className="relative block">
                  <img src={e.image ?? ""} alt={e.title} className="aspect-[2/1] w-full object-cover transition hover:opacity-90" />
                  <span className={`chip absolute left-3 top-3 ${color}`}>{label}</span>
                  <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-primary-400">{e.price ? xof(e.price) : "Gratuit"}</span>
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <Link href={`/dashboard/events/${e.id}`} className="text-lg font-bold text-primary-400 hover:underline">{e.title}</Link>
                  <div className="mt-2"><ExpandableText text={e.description} lines={2} className="text-sm text-slate-500" /></div>
                  <div className="mt-4 space-y-1.5 text-sm text-slate-600">
                    <p className="flex items-center gap-2"><CalendarDays size={15} className="text-slate-400" />
                      {dateFr(e.startDate, { day: "numeric", month: "short" })}{e.endDate.toDateString() !== e.startDate.toDateString() && ` → ${dateFr(e.endDate, { day: "numeric", month: "short" })}`} · {timeFr(e.startDate)}</p>
                    <p className="flex items-center gap-2"><MapPin size={15} className="text-slate-400" /> {e.location}</p>
                    <p className="flex items-center gap-2"><Users size={15} className="text-slate-400" /> {n}/{e.capacity} inscrits
                      {left <= 5 && left > 0 && <span className="chip bg-red-100 text-red-700">plus que {left} places</span>}</p>
                  </div>
                  <div className="mt-auto space-y-2 pt-5">
                    <Link href={`/dashboard/events/${e.id}`} className="btn-ghost w-full">Voir le détail</Link>
                    {status === "CONFIRMED" ? (
                      <p className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-700"><CheckCircle2 size={16} /> Vous êtes inscrit(e)</p>
                    ) : past ? null : left <= 0 ? (
                      <p className="rounded-xl bg-slate-100 py-2.5 text-center text-sm font-semibold text-slate-500">Complet</p>
                    ) : (
                      <ActionButton url={`/api/events/${e.id}/register`}>
                        {status === "PENDING_PAYMENT" ? "Finaliser le paiement" : e.price ? `S'inscrire · ${xof(e.price)}` : "S'inscrire gratuitement"}
                      </ActionButton>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
