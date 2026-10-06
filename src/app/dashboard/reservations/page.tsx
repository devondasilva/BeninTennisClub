import Link from "next/link";
import { Plus, CalendarDays, Clock, Timer } from "lucide-react";
import { db } from "@/db";
import { sortBy, withReservationRefs } from "@/db/relations";
import { requireSession } from "@/lib/auth";
import { dateFr, timeFr, xof } from "@/lib/format";
import { PageHeader, StatCard, StatusBadge } from "@/components/ui";
import CancelButton from "@/components/CancelButton";
import { SegLinks } from "../_member/ui";

export const metadata = { title: "Réservations" };

export default async function ReservationsPage({ searchParams }: { searchParams: Promise<{ tab?: string; scope?: string }> }) {
  const s = await requireSession();
  const { tab = "upcoming", scope } = await searchParams;
  const staff = s.can("reservations.manage");
  const all = staff && scope === "club";
  const now = new Date();

  const scoped = db.reservations.filter((r) => all || r.userId === s.userId);
  const list = sortBy(
    withReservationRefs(scoped.filter((r) => (tab === "upcoming" ? r.endTime >= now : r.endTime < now))),
    "startTime",
    tab === "upcoming" ? "asc" : "desc"
  ).slice(0, 60);

  // Indicateurs (sur le même périmètre : les miennes / tout le club)
  const upcomingCount = scoped.filter((r) => r.endTime >= now && r.status !== "CANCELLED").length;
  const toPay = scoped.filter((r) => r.status === "PENDING_PAYMENT" && r.endTime >= now).length;
  const playedHours = scoped
    .filter((r) => r.status === "CONFIRMED" && r.endTime < now)
    .reduce((h, r) => h + (r.endTime.getTime() - r.startTime.getTime()) / 3600000, 0);

  const club = all ? "&scope=club" : "";

  return (
    <div>
      <PageHeader title="Réservations" subtitle={all ? "Toutes les réservations du club" : "Vos créneaux sur les courts du club"}
        action={<Link href="/dashboard/reservations/new" className="btn-primary"><Plus size={16} /> Nouvelle réservation</Link>} />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="À venir" value={String(upcomingCount)} icon={CalendarDays} tone="navy" hint={all ? "Sur tous les courts" : "Créneaux réservés"} />
        <StatCard label="En attente de paiement" value={String(toPay)} icon={Clock} tone="clay" hint="À régler pour confirmer" />
        <StatCard label="Heures jouées" value={`${playedHours.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} h`} icon={Timer} tone="lime" />
      </div>

      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/[0.06] p-5 md:p-6">
          <div>
            <h2 className="font-display text-xl font-black tracking-tight text-ink">{tab === "upcoming" ? "Créneaux à venir" : "Créneaux passés"}</h2>
            <p className="text-sm text-muted">{list.length} réservation{list.length > 1 ? "s" : ""}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SegLinks label="Période" items={[
              { href: `?tab=upcoming${club}`, label: "À venir", active: tab === "upcoming" },
              { href: `?tab=past${club}`, label: "Passées", active: tab !== "upcoming" },
            ]} />
            {staff && (
              <SegLinks label="Périmètre" items={[
                { href: `?tab=${tab}`, label: "Les miennes", active: !all },
                { href: `?tab=${tab}&scope=club`, label: "Tout le club", active: all },
              ]} />
            )}
          </div>
        </div>

        {list.length === 0 ? (
          <div className="p-12 text-center text-muted">
            Aucune réservation. <Link href="/dashboard/reservations/new" className="font-semibold text-brand underline">Réserver un court</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr><th>Court</th><th>Date</th><th>Horaire</th>{all && <th>Membre</th>}<th>Coach</th><th>Montant</th><th>Statut</th><th><span className="sr-only">Actions</span></th></tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-mist/60">
                    <td>
                      <div className="flex items-center gap-3">
                        <img src={r.court.image ?? ""} alt="" className="h-10 w-16 shrink-0 rounded-xl object-cover" />
                        <div><p className="whitespace-nowrap font-bold text-ink">{r.court.name}</p><p className="text-xs text-muted">{r.court.surface}</p></div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap capitalize">{dateFr(r.startTime, { weekday: "short", day: "numeric", month: "short" })}</td>
                    <td className="tabular whitespace-nowrap">{timeFr(r.startTime)} – {timeFr(r.endTime)}</td>
                    {all && <td className="whitespace-nowrap">{r.user.firstName} {r.user.lastName}</td>}
                    <td className="whitespace-nowrap">{r.coach ? `${r.coach.firstName} ${r.coach.lastName}` : <span className="text-ink/35">—</span>}</td>
                    <td className="tabular whitespace-nowrap font-bold text-ink">{xof(r.price)}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td className="text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        {r.status === "PENDING_PAYMENT" && r.userId === s.userId && <PayLink id={r.id} />}
                        {tab === "upcoming" && r.status !== "CANCELLED" && (staff || r.startTime.getTime() - now.getTime() > 24 * 3600000) && <CancelButton url={`/api/reservations/${r.id}`} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function PayLink({ id }: { id: string }) {
  const tx = db.transactions.find((t) => t.relatedId === id && t.status === "PENDING");
  if (!tx) return null;
  return <Link href={`/dashboard/payments/${tx.id}`} className="btn-primary btn-sm !px-3 !py-1.5">Payer</Link>;
}
