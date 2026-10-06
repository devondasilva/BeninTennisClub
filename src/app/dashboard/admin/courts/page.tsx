import Link from "next/link";
import { asc, sql } from "drizzle-orm";
import { Plus, Pencil } from "lucide-react";
import { db, t } from "@/db";
import { requireSession } from "@/lib/auth";
import { xof } from "@/lib/format";
import { PageHeader } from "@/components/ui";
import BackLink from "@/components/admin/BackLink";
import Flash from "@/components/admin/Flash";

export const metadata = { title: "Courts & tarifs" };

export default async function AdminCourts({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireSession("courts.manage");
  const { ok } = await searchParams;
  const courts = await db.query.courts.findMany({ orderBy: asc(t.courts.name) });
  const upcoming = await db.select({ courtId: t.reservations.courtId, n: sql<number>`count(*)` }).from(t.reservations)
    .where(sql`${t.reservations.startTime} >= ${Date.now()} and ${t.reservations.status} != 'CANCELLED'`).groupBy(t.reservations.courtId);
  return (
    <div>
      <BackLink href="/dashboard/admin" label="Centre de contrôle" />
      <PageHeader title="Courts & tarifs" subtitle="Prix des créneaux, photos et ouverture des courts"
        action={<Link href="/dashboard/admin/courts/new" className="btn-accent"><Plus size={16} /> Ajouter un court</Link>} />
      <Flash text={ok} />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {courts.map((c) => (
          <div key={c.id} className={`card overflow-hidden ${c.isActive ? "" : "opacity-70"}`}>
            <img src={c.image ?? ""} alt="" className="aspect-[12/7] w-full object-cover" />
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-primary-400">{c.name}</h2>
                <span className={`chip ${c.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"}`}>{c.isActive ? "Ouvert" : "Fermé"}</span>
              </div>
              <p className="text-sm text-slate-500">{c.surface}</p>
              <p className="mt-3 text-sm"><b className="text-primary-400">{xof(c.pricePerSlot)}</b> / 30 min · {xof(c.pricePerSlot * 2)} / h</p>
              <p className="text-sm text-slate-500">{upcoming.find((u) => u.courtId === c.id)?.n ?? 0} réservations à venir</p>
              <Link href={`/dashboard/admin/courts/${c.id}/edit`} className="btn-primary mt-4 w-full"><Pencil size={14} /> Modifier</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
