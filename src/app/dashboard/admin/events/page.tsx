import Link from "next/link";
import { Plus, Pencil, Users, Trophy, CalendarCheck, Wallet, CalendarDays } from "lucide-react";
import { db } from "@/db";
import { sortBy } from "@/db/relations";
import { requireSession } from "@/lib/auth";
import { dateFr, xof } from "@/lib/format";
import { PageHeader, StatCard, Empty } from "@/components/ui";
import BackLink from "@/components/admin/BackLink";
import Flash from "@/components/admin/Flash";
import { Badge, type Tone } from "@/components/admin/kit";
import EventActions from "./EventActions";

export const metadata = { title: "Gestion des événements" };

export default async function AdminEvents({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireSession("events.manage");
  const { ok } = await searchParams;
  const events = sortBy(db.events.all(), "startDate", "desc");
  const regs = new Map<string, { n: number; paid: number }>();
  for (const r of db.eventRegistrations.all()) {
    const x = regs.get(r.eventId) ?? { n: 0, paid: 0 };
    x.n += 1;
    if (r.status === "CONFIRMED") x.paid += 1;
    regs.set(r.eventId, x);
  }
  const now = Date.now();
  const upcoming = events.filter((e) => e.status !== "CANCELLED" && e.endDate.getTime() >= now);
  const confirmedUpcoming = upcoming.reduce((a, e) => a + (regs.get(e.id)?.paid ?? 0), 0);
  const revenue = events.filter((e) => e.status !== "CANCELLED").reduce((a, e) => a + (regs.get(e.id)?.paid ?? 0) * e.price, 0);
  const seats = upcoming.reduce((a, e) => a + e.capacity, 0);

  return (
    <div>
      <BackLink href="/dashboard/admin" label="Centre de contrôle" />
      <PageHeader eyebrow="Back-office · Événements" title="Gestion des événements" subtitle="Modifier, annuler et consulter les inscrits"
        action={<Link href="/dashboard/events/new" className="btn-primary"><Plus size={16} /> Créer un événement</Link>} />
      <Flash text={ok} />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Événements à venir" value={String(upcoming.length)} icon={Trophy} tone="navy" hint={`${events.length} au total`} />
        <StatCard label="Inscrits confirmés" value={String(confirmedUpcoming)} icon={CalendarCheck} tone="sky" hint="Sur les événements à venir" />
        <StatCard label="Taux de remplissage" value={`${seats ? Math.round((confirmedUpcoming / seats) * 100) : 0} %`} icon={Users} tone="lime" hint={`${seats} places ouvertes`} />
        <StatCard label="Recettes des inscriptions" value={xof(revenue)} icon={Wallet} tone="clay" />
      </div>
      {events.length === 0 ? <Empty>Aucun événement.</Empty> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-base min-w-[860px]">
              <thead><tr><th>Événement</th><th>Date</th><th>Prix</th><th>Inscrits</th><th>Statut</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {events.map((e) => {
                  const r = regs.get(e.id);
                  const paid = r?.paid ?? 0;
                  const [label, tone]: [string, Tone] = e.status === "CANCELLED" ? ["Annulé", "red"] : e.endDate.getTime() < now ? ["Terminé", "slate"] : ["À venir", "green"];
                  const pct = e.capacity ? Math.min(100, (paid / e.capacity) * 100) : 0;
                  return (
                    <tr key={e.id} className="transition hover:bg-mist/60">
                      <td>
                        <Link href={`/dashboard/admin/events/${e.id}`} className="group flex items-center gap-3">
                          <img src={e.image ?? "/images/logo.svg"} alt="" className="h-11 w-20 shrink-0 rounded-xl object-cover" />
                          <span className="font-semibold text-ink group-hover:text-brand group-hover:underline">{e.title}</span>
                        </Link>
                      </td>
                      <td className="whitespace-nowrap text-muted"><span className="inline-flex items-center gap-1.5"><CalendarDays size={14} aria-hidden /> {dateFr(e.startDate, { day: "numeric", month: "short", year: "numeric" })}</span></td>
                      <td className="tabular whitespace-nowrap font-semibold">{e.price ? xof(e.price) : "Gratuit"}</td>
                      <td className="whitespace-nowrap">
                        <span className="tabular font-semibold text-ink">{paid} / {e.capacity}</span>
                        <span className="mt-1 block h-1.5 w-20 overflow-hidden rounded-full bg-cloud"><span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} /></span>
                      </td>
                      <td><Badge tone={tone}>{label}</Badge></td>
                      <td>
                        <div className="flex flex-wrap items-center justify-end gap-3">
                          <Link href={`/dashboard/admin/events/${e.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"><Users size={13} /> Inscrits</Link>
                          {e.status !== "CANCELLED" && <Link href={`/dashboard/events/${e.id}/edit`} className="btn-primary btn-sm"><Pencil size={13} /> Modifier</Link>}
                          {e.status !== "CANCELLED" && <EventActions id={e.id} registrations={r?.n ?? 0} />}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
