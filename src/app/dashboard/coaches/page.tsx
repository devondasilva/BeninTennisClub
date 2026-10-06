import Link from "next/link";
import { Plus, Award, Clock, Phone, Mail, BadgePercent, Users, CalendarCheck, Wallet, ArrowRight } from "lucide-react";
import { db } from "@/db";
import { requireSession } from "@/lib/auth";
import { xof } from "@/lib/format";
import { PageHeader, StatCard } from "@/components/ui";

export const metadata = { title: "Coachs" };

export default async function CoachesPage() {
  const s = await requireSession();
  const staff = s.can("coaches.manage");
  const coaches = db.coaches.filter((c) => staff || c.status === "ACTIVE");

  const sessions = new Map<string, number>();
  for (const r of db.reservations.filter((r) => !!r.coachId && r.status === "CONFIRMED")) sessions.set(r.coachId!, (sessions.get(r.coachId!) ?? 0) + 1);
  const earned = new Map<string, number>();
  if (staff) for (const c of db.commissions.all()) earned.set(c.coachId, (earned.get(c.coachId) ?? 0) + c.amount);

  const totalSessions = coaches.reduce((n, c) => n + (sessions.get(c.id) ?? 0), 0);
  const totalEarned = [...earned.values()].reduce((a, b) => a + b, 0);
  const minRate = coaches.length ? Math.min(...coaches.map((c) => c.hourlyRate)) : 0;

  return (
    <div>
      <PageHeader title="Nos coachs" subtitle="Réservez un cours particulier en ajoutant un coach à votre réservation"
        action={staff && (
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/coaches/commissions" className="btn-ghost"><BadgePercent size={16} /> Commissions</Link>
            <Link href="/dashboard/coaches/new" className="btn-primary"><Plus size={16} /> Ajouter un coach</Link>
          </div>
        )} />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label={staff ? "Coachs dans l'équipe" : "Coachs disponibles"} value={String(coaches.length)} icon={Users} tone="navy" />
        <StatCard label="Séances confirmées" value={String(totalSessions)} icon={CalendarCheck} tone="sky" />
        {staff
          ? <StatCard label="Commissions générées" value={xof(totalEarned)} icon={Wallet} tone="lime" />
          : <StatCard label="Cours à partir de" value={`${xof(minRate)} / h`} icon={Wallet} tone="lime" hint="En plus du prix du court" />}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {coaches.map((c) => (
          <article key={c.id} className="card group flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl hover:shadow-brand/10 sm:flex-row">
            <div className="relative overflow-hidden bg-mist sm:w-52 sm:shrink-0">
              <img src={c.photo ?? ""} alt={`${c.firstName} ${c.lastName}`} className="aspect-square h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              {staff && c.status !== "ACTIVE" && <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">Masqué</span>}
            </div>
            <div className="flex flex-1 flex-col p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">{c.specialization}</p>
              <h3 className="mt-1 font-display text-2xl font-black tracking-tight text-ink">{c.firstName} {c.lastName}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{c.bio}</p>
              <div className="mb-5 mt-4 grid grid-cols-1 gap-2 text-sm text-ink/75 sm:grid-cols-2">
                <span className="flex items-center gap-1.5"><Award size={15} className="text-brand" /> {c.experience} ans d'expérience</span>
                <span className="flex items-center gap-1.5"><Clock size={15} className="text-brand" /> {sessions.get(c.id) ?? 0} séances</span>
                {staff && <span className="flex items-center gap-1.5"><Phone size={15} className="text-brand" /> {c.phone}</span>}
                {staff && <span className="flex min-w-0 items-center gap-1.5"><Mail size={15} className="shrink-0 text-brand" /> <span className="truncate">{c.email}</span></span>}
              </div>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-ink/[0.06] pt-4">
                <span className="tabular font-display text-xl font-black text-brand">{xof(c.hourlyRate)}<span className="font-sans text-sm font-semibold text-muted"> / h</span></span>
                {staff ? (
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="chip bg-lime-light text-ink">Commission {c.commissionRate} % · {xof(earned.get(c.id) ?? 0)} générés</span>
                    <Link href={`/dashboard/coaches/${c.id}/edit`} className="btn-ghost btn-sm">Modifier</Link>
                    <Link href={`/coachs/${c.id}`} className="text-xs font-bold uppercase tracking-widest text-brand hover:text-ink">Fiche publique</Link>
                  </span>
                ) : (
                  <span className="flex flex-wrap items-center gap-3">
                    <Link href={`/coachs/${c.id}`} className="text-xs font-bold uppercase tracking-widest text-brand hover:text-ink">Profil</Link>
                    <Link href={`/dashboard/reservations/new?coach=${c.id}`} className="btn-primary btn-sm">Réserver avec {c.firstName} <ArrowRight size={14} /></Link>
                  </span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
