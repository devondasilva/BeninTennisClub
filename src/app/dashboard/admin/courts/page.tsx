import Link from "next/link";
import { Plus, Pencil, MapPin, CalendarClock, Coins, DoorClosed } from "lucide-react";
import { db } from "@/db";
import { requireSession } from "@/lib/auth";
import { xof } from "@/lib/format";
import { PageHeader, StatCard, Empty } from "@/components/ui";
import BackLink from "@/components/admin/BackLink";
import Flash from "@/components/admin/Flash";
import { Badge } from "@/components/admin/kit";

export const metadata = { title: "Courts & tarifs" };

export default async function AdminCourts({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireSession("courts.manage");
  const { ok } = await searchParams;
  const courts = db.courts.all().sort((a, b) => a.name.localeCompare(b.name));
  const now = new Date();
  const upcoming = new Map<string, number>();
  for (const r of db.reservations.filter((r) => r.startTime >= now && r.status !== "CANCELLED")) upcoming.set(r.courtId, (upcoming.get(r.courtId) ?? 0) + 1);
  const open = courts.filter((c) => c.isActive);
  const avg = open.length ? open.reduce((a, c) => a + c.pricePerSlot, 0) / open.length : 0;

  return (
    <div>
      <BackLink href="/dashboard/admin" label="Centre de contrôle" />
      <PageHeader eyebrow="Back-office · Courts" title="Courts & tarifs" subtitle="Prix des créneaux, photos et ouverture des courts"
        action={<Link href="/dashboard/admin/courts/new" className="btn-primary"><Plus size={16} /> Ajouter un court</Link>} />
      <Flash text={ok} />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Courts ouverts" value={`${open.length} / ${courts.length}`} icon={MapPin} tone="navy" />
        <StatCard label="Réservations à venir" value={String([...upcoming.values()].reduce((a, n) => a + n, 0))} icon={CalendarClock} tone="sky" />
        <StatCard label="Prix moyen / heure" value={xof(Math.round(avg * 2))} icon={Coins} tone="lime" hint="Courts ouverts" />
        <StatCard label="Courts fermés" value={String(courts.length - open.length)} icon={DoorClosed} tone="clay" />
      </div>
      {courts.length === 0 ? <Empty>Aucun court pour l'instant.</Empty> : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courts.map((c) => (
            <article key={c.id} className={`card group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10 ${c.isActive ? "" : "opacity-75"}`}>
              <div className="relative p-3 pb-0">
                <img src={c.image ?? "/images/courts/court-1.svg"} alt="" className="aspect-[12/7] w-full rounded-[1.5rem] object-cover" />
                <span className="absolute left-6 top-6"><Badge tone={c.isActive ? "green" : "red"} className="shadow-sm">{c.isActive ? "Ouvert" : "Fermé"}</Badge></span>
              </div>
              <div className="p-6 pt-5">
                <h2 className="text-lg font-bold text-ink">{c.name}</h2>
                <p className="text-sm text-muted">{c.surface}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-mist p-4 text-sm">
                  <div><p className="text-[10px] font-bold uppercase tracking-widest text-ink/45">30 min</p><p className="tabular font-bold text-ink">{xof(c.pricePerSlot)}</p></div>
                  <div><p className="text-[10px] font-bold uppercase tracking-widest text-ink/45">1 heure</p><p className="tabular font-bold text-ink">{xof(c.pricePerSlot * 2)}</p></div>
                </div>
                <p className="mt-3 text-sm text-muted">{upcoming.get(c.id) ?? 0} réservations à venir</p>
                <Link href={`/dashboard/admin/courts/${c.id}/edit`} className="btn-primary mt-5 w-full"><Pencil size={14} /> Modifier</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
