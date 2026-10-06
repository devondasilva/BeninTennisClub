import Link from "next/link";
import { and, asc, desc, eq, gte, lt } from "drizzle-orm";
import { Plus } from "lucide-react";
import { db, t } from "@/db";
import { requireSession } from "@/lib/auth";
import { dateFr, timeFr, xof } from "@/lib/format";
import { Empty, PageHeader, StatusBadge } from "@/components/ui";
import CancelButton from "@/components/CancelButton";

export const metadata = { title: "Réservations" };

export default async function ReservationsPage({ searchParams }: { searchParams: Promise<{ tab?: string; scope?: string }> }) {
  const s = await requireSession();
  const { tab = "upcoming", scope } = await searchParams;
  const staff = s.can("reservations.manage");
  const all = staff && scope === "club";
  const now = new Date();

  const where = and(
    all ? undefined : eq(t.reservations.userId, s.userId),
    tab === "upcoming" ? gte(t.reservations.endTime, now) : lt(t.reservations.endTime, now)
  );
  const list = await db.query.reservations.findMany({
    where,
    with: { court: true, coach: true, user: true },
    orderBy: tab === "upcoming" ? asc(t.reservations.startTime) : desc(t.reservations.startTime),
    limit: 60,
  });

  const tabLink = (k: string, label: string) => (
    <Link href={`?tab=${k}${all ? "&scope=club" : ""}`}
      className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === k ? "bg-white text-primary-400 shadow-soft" : "text-slate-500"}`}>{label}</Link>
  );

  return (
    <div>
      <PageHeader title="Réservations" subtitle={all ? "Toutes les réservations du club" : "Vos créneaux sur les courts du club"}
        action={<Link href="/dashboard/reservations/new" className="btn-accent"><Plus size={16} /> Nouvelle réservation</Link>} />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-xl bg-slate-100 p-1">{tabLink("upcoming", "À venir")}{tabLink("past", "Passées")}</div>
        {staff && (
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            <Link href={`?tab=${tab}`} className={`rounded-lg px-4 py-2 text-sm font-semibold ${!all ? "bg-white text-primary-400 shadow-soft" : "text-slate-500"}`}>Les miennes</Link>
            <Link href={`?tab=${tab}&scope=club`} className={`rounded-lg px-4 py-2 text-sm font-semibold ${all ? "bg-white text-primary-400 shadow-soft" : "text-slate-500"}`}>Tout le club</Link>
          </div>
        )}
      </div>

      {list.length === 0 ? (
        <Empty>Aucune réservation. <Link href="/dashboard/reservations/new" className="font-semibold text-primary-400 underline">Réserver un court</Link></Empty>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr><th>Court</th><th>Date</th><th>Horaire</th>{all && <th>Membre</th>}<th>Coach</th><th>Montant</th><th>Statut</th><th></th></tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <img src={r.court.image ?? ""} alt="" className="h-9 w-14 rounded-md object-cover" />
                      <div><p className="font-semibold text-primary-400">{r.court.name}</p><p className="text-xs text-slate-400">{r.court.surface}</p></div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap">{dateFr(r.startTime, { weekday: "short", day: "numeric", month: "short" })}</td>
                  <td className="whitespace-nowrap">{timeFr(r.startTime)} – {timeFr(r.endTime)}</td>
                  {all && <td>{r.user.firstName} {r.user.lastName}</td>}
                  <td>{r.coach ? `${r.coach.firstName} ${r.coach.lastName}` : <span className="text-slate-400">—</span>}</td>
                  <td className="whitespace-nowrap font-semibold">{xof(r.price)}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td className="text-right">
                    {r.status === "PENDING_PAYMENT" && r.userId === s.userId && <PayLink id={r.id} />}
                    {tab === "upcoming" && r.status !== "CANCELLED" && (staff || r.startTime.getTime() - now.getTime() > 24 * 3600000) && <CancelButton url={`/api/reservations/${r.id}`} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

async function PayLink({ id }: { id: string }) {
  const tx = await db.query.transactions.findFirst({ where: and(eq(t.transactions.relatedId, id), eq(t.transactions.status, "PENDING")) });
  if (!tx) return null;
  return <Link href={`/dashboard/payments/${tx.id}`} className="mb-1 block text-xs font-semibold text-primary-400 underline">Payer</Link>;
}
