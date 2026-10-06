import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import { Plus, Pencil, Users } from "lucide-react";
import { db, t } from "@/db";
import { requireSession } from "@/lib/auth";
import { dateFr, xof } from "@/lib/format";
import { PageHeader } from "@/components/ui";
import BackLink from "@/components/admin/BackLink";
import Flash from "@/components/admin/Flash";
import EventActions from "./EventActions";

export const metadata = { title: "Gestion des événements" };

export default async function AdminEvents({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireSession("events.manage");
  const { ok } = await searchParams;
  const events = await db.query.events.findMany({ orderBy: desc(t.events.startDate) });
  const regs = await db.select({ eventId: t.eventRegistrations.eventId, n: sql<number>`count(*)`, paid: sql<number>`sum(case when ${t.eventRegistrations.status} = 'CONFIRMED' then 1 else 0 end)` })
    .from(t.eventRegistrations).groupBy(t.eventRegistrations.eventId);
  const now = Date.now();
  return (
    <div>
      <BackLink href="/dashboard/admin" label="Centre de contrôle" />
      <PageHeader title="Gestion des événements" subtitle="Modifier, annuler et consulter les inscrits"
        action={<Link href="/dashboard/events/new" className="btn-accent"><Plus size={16} /> Créer un événement</Link>} />
      <Flash text={ok} />
      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead><tr><th>Événement</th><th>Date</th><th>Prix</th><th>Inscrits</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            {events.map((e) => {
              const r = regs.find((x) => x.eventId === e.id);
              const state = e.status === "CANCELLED" ? ["Annulé", "bg-red-100 text-red-700"] : e.endDate.getTime() < now ? ["Terminé", "bg-slate-200 text-slate-600"] : ["À venir", "bg-emerald-100 text-emerald-800"];
              return (
                <tr key={e.id}>
                  <td><Link href={`/dashboard/admin/events/${e.id}`} className="flex items-center gap-3 hover:underline"><img src={e.image ?? ""} alt="" className="h-10 w-20 rounded-md object-cover" /><span className="font-semibold text-primary-400">{e.title}</span></Link></td>
                  <td className="whitespace-nowrap">{dateFr(e.startDate, { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="whitespace-nowrap">{e.price ? xof(e.price) : "Gratuit"}</td>
                  <td className="whitespace-nowrap">{r?.paid ?? 0} / {e.capacity}</td>
                  <td><span className={`chip ${state[1]}`}>{state[0]}</span></td>
                  <td>
                    <div className="flex flex-wrap items-center justify-end gap-3">
                      <Link href={`/dashboard/admin/events/${e.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-primary-400 hover:underline"><Users size={13} /> Inscrits</Link>
                      {e.status !== "CANCELLED" && <Link href={`/dashboard/events/${e.id}/edit`} className="btn-primary px-3 py-1.5 text-xs"><Pencil size={13} /> Modifier</Link>}
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
  );
}
