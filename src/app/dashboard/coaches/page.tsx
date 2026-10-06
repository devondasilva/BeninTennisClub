import Link from "next/link";
import { count, eq, sql } from "drizzle-orm";
import { Plus, Award, Clock, Phone, Mail, BadgePercent } from "lucide-react";
import { db, t } from "@/db";
import { requireSession } from "@/lib/auth";
import { xof } from "@/lib/format";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Coachs" };

export default async function CoachesPage() {
  const s = await requireSession();
  const staff = s.can("coaches.manage");
  const coaches = await db.query.coaches.findMany({ where: staff ? undefined : eq(t.coaches.status, "ACTIVE") });
  const sessions = await db.select({ coachId: t.reservations.coachId, n: count() }).from(t.reservations)
    .where(sql`${t.reservations.coachId} is not null and ${t.reservations.status} = 'CONFIRMED'`).groupBy(t.reservations.coachId);
  const earned = staff ? await db.select({ coachId: t.commissions.coachId, v: sql<number>`sum(${t.commissions.amount})` }).from(t.commissions).groupBy(t.commissions.coachId) : [];

  return (
    <div>
      <PageHeader title="Nos coachs" subtitle="Réservez un cours particulier en ajoutant un coach à votre réservation"
        action={staff && (
          <div className="flex gap-2">
            <Link href="/dashboard/coaches/commissions" className="btn-ghost"><BadgePercent size={16} /> Commissions</Link>
            <Link href="/dashboard/coaches/new" className="btn-accent"><Plus size={16} /> Ajouter un coach</Link>
          </div>
        )} />
      <div className="grid gap-6 md:grid-cols-2">
        {coaches.map((c) => (
          <div key={c.id} className="card flex flex-col overflow-hidden sm:flex-row">
            <img src={c.photo ?? ""} alt={`${c.firstName} ${c.lastName}`} className="aspect-square w-full object-cover sm:w-48" />
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-xl font-bold text-primary-400">{c.firstName} {c.lastName}</h3>
              <p className="text-sm font-semibold text-accent-700">{c.specialization}</p>
              <p className="mt-2 text-sm text-slate-500">{c.bio}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600">
                <span className="flex items-center gap-1.5"><Award size={15} className="text-slate-400" /> {c.experience} ans d'expérience</span>
                <span className="flex items-center gap-1.5"><Clock size={15} className="text-slate-400" /> {sessions.find((x) => x.coachId === c.id)?.n ?? 0} séances</span>
                {staff && <span className="flex items-center gap-1.5"><Phone size={15} className="text-slate-400" /> {c.phone}</span>}
                {staff && <span className="flex items-center gap-1.5 truncate"><Mail size={15} className="text-slate-400" /> {c.email}</span>}
              </div>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
                <span className="text-lg font-bold text-primary-400">{xof(c.hourlyRate)}<span className="text-sm font-normal text-slate-400"> / h</span></span>
                {staff ? (
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="chip bg-accent-100 text-primary-400">Commission {c.commissionRate} % · {xof(earned.find((e) => e.coachId === c.id)?.v ?? 0)} générés</span>
                    <Link href={`/dashboard/coaches/${c.id}/edit`} className="btn-ghost px-3 py-1.5 text-xs">Modifier</Link>
                    <Link href={`/coachs/${c.id}`} className="text-xs font-semibold text-primary-400 hover:underline">Fiche publique</Link>
                  </span>
                ) : (
                  <span className="flex items-center gap-3"><Link href={`/coachs/${c.id}`} className="text-sm font-semibold text-primary-400 hover:underline">Profil</Link><Link href={`/dashboard/reservations/new?coach=${c.id}`} className="btn-accent px-3 py-2">Réserver avec {c.firstName}</Link></span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
