import Link from "next/link";
import { CalendarDays, MapPin, Users, Plus, CheckCircle2, ArrowRight } from "lucide-react";
import { db } from "@/db";
import { sortBy } from "@/db/relations";
import { requireSession } from "@/lib/auth";
import { dateFr, timeFr, xof } from "@/lib/format";
import { Empty, PageHeader } from "@/components/ui";
import ActionButton from "@/components/ActionButton";
import AdSlot from "@/components/AdSlot";
import ExpandableText from "@/components/ExpandableText";
import { SegLinks } from "../_member/ui";

export const metadata = { title: "Événements" };

const TYPES: Record<string, [string, string]> = {
  TOURNAMENT: ["Tournoi", "bg-amber-100 text-amber-900"],
  STAGE: ["Stage", "bg-lime text-ink"],
  SCHOOL: ["École de tennis", "bg-sky-100 text-sky-900"],
  GATHERING: ["Convivialité", "bg-pink-100 text-pink-900"],
};

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ type?: string; past?: string }> }) {
  const s = await requireSession();
  const { type, past } = await searchParams;
  const now = new Date();
  const events = sortBy(
    db.events.filter((e) => e.status === "ACTIVE" && (!type || e.type === type) && (past ? e.endDate < now : e.endDate >= now)),
    "startDate",
    "asc"
  );
  const counts = new Map<string, number>();
  for (const r of db.eventRegistrations.filter((r) => r.status === "CONFIRMED")) counts.set(r.eventId, (counts.get(r.eventId) ?? 0) + 1);
  const mine = db.eventRegistrations.filter((r) => r.userId === s.userId);
  const countOf = (id: string) => counts.get(id) ?? 0;
  const myStatus = (id: string) => mine.find((m) => m.eventId === id)?.status;

  const filters = [["", "Tous"], ["TOURNAMENT", "Tournois"], ["STAGE", "Stages"], ["SCHOOL", "École"], ["GATHERING", "Convivialité"]];

  return (
    <div>
      <PageHeader title="Événements" subtitle="Tournois, stages, école de tennis et soirées du club"
        action={s.can("events.manage") && <Link href="/dashboard/events/new" className="btn-primary"><Plus size={16} /> Créer un événement</Link>} />

      <AdSlot placement="EVENTS" className="mb-6" />
      <div className="mb-8">
        <SegLinks label="Filtrer les événements" items={[
          ...filters.map(([k, l]) => ({ href: k ? `?type=${k}` : "?", label: l, active: (type ?? "") === k && !past })),
          { href: "?past=1", label: "Passés", active: !!past },
        ]} />
      </div>

      {events.length === 0 ? <Empty>Aucun événement dans cette catégorie.</Empty> : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {events.map((e) => {
            const n = countOf(e.id), left = e.capacity - n, status = myStatus(e.id);
            const [label, color] = TYPES[e.type] ?? [e.type, "bg-white text-ink"];
            const fill = Math.min(100, (n / Math.max(1, e.capacity)) * 100);
            return (
              <article key={e.id} className="card group flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl hover:shadow-brand/10">
                <Link href={`/dashboard/events/${e.id}`} className="relative block overflow-hidden" tabIndex={-1} aria-hidden>
                  <img src={e.image ?? ""} alt="" className="aspect-[2/1] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <span className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${color}`}>{label}</span>
                  <span className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-ink backdrop-blur">{e.price ? xof(e.price) : "Gratuit"}</span>
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">
                    {dateFr(e.startDate, { day: "numeric", month: "short" })}{e.endDate.toDateString() !== e.startDate.toDateString() && ` → ${dateFr(e.endDate, { day: "numeric", month: "short" })}`}
                  </p>
                  <Link href={`/dashboard/events/${e.id}`} className="mt-1 font-display text-xl font-black leading-snug tracking-tight text-ink hover:text-brand">{e.title}</Link>
                  <div className="mt-2"><ExpandableText text={e.description} lines={2} className="text-sm text-muted" /></div>
                  <div className="mt-4 space-y-1.5 text-sm text-ink/75">
                    <p className="flex items-center gap-2"><CalendarDays size={15} className="text-brand" />
                      {dateFr(e.startDate, { day: "numeric", month: "short" })} · {timeFr(e.startDate)}</p>
                    <p className="flex items-center gap-2"><MapPin size={15} className="text-brand" /> {e.location}</p>
                    <p className="flex flex-wrap items-center gap-2"><Users size={15} className="text-brand" /> {n}/{e.capacity} inscrits
                      {left <= 5 && left > 0 && <span className="chip bg-red-100 text-red-800">plus que {left} places</span>}</p>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-cloud" aria-hidden>
                    <div className="h-full rounded-full bg-gradient-to-r from-brand to-lime-dark" style={{ width: `${fill}%` }} />
                  </div>
                  <div className="mt-auto space-y-2 pt-6">
                    <Link href={`/dashboard/events/${e.id}`} className="btn-ghost w-full">Voir le détail <ArrowRight size={15} /></Link>
                    {status === "CONFIRMED" ? (
                      <p className="flex items-center justify-center gap-2 rounded-2xl bg-lime-light py-3 text-sm font-bold text-ink"><CheckCircle2 size={16} className="text-accent-700" /> Vous êtes inscrit(e)</p>
                    ) : past ? null : left <= 0 ? (
                      <p className="rounded-2xl bg-cloud py-3 text-center text-sm font-bold text-muted">Complet</p>
                    ) : (
                      <ActionButton url={`/api/events/${e.id}/register`} className="btn-primary">
                        {status === "PENDING_PAYMENT" ? "Finaliser le paiement" : e.price ? `S'inscrire · ${xof(e.price)}` : "S'inscrire gratuitement"}
                      </ActionButton>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
