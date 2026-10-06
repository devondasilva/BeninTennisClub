import Link from "next/link";
import { eq } from "drizzle-orm";
import { Award, Languages, ArrowRight, CalendarCheck, UserCheck, CreditCard } from "lucide-react";
import { db, t } from "@/db";
import { xof } from "@/lib/format";
import { coachRatings } from "@/lib/coaches";
import PageHero from "@/components/site/PageHero";
import Stars from "@/components/Stars";
import AdSlot from "@/components/AdSlot";

export const metadata = { title: "Nos coachs & formateurs" };

export default async function CoachsPage() {
  const coaches = await db.query.coaches.findMany({ where: eq(t.coaches.status, "ACTIVE") });
  const rating = await coachRatings();

  return (
    <>
      <PageHero kicker="L'équipe pédagogique" title="Nos coachs & formateurs"
        text="Six professionnels diplômés pour tous les âges et tous les niveaux : de la première balle en mini-tennis jusqu'au circuit ITF."
        image="/images/hero-graphic.svg" />

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {coaches.map((c) => {
            const r = rating(c.id);
            return (
              <Link key={c.id} href={`/coachs/${c.id}`} className="group flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-medium">
                <div className="relative">
                  <img src={c.photo ?? ""} alt={`${c.firstName} ${c.lastName}`} className="aspect-[4/3] w-full object-cover object-top" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-primary-400">{xof(c.hourlyRate)} / h</span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="text-xl font-bold text-primary-400 group-hover:underline">{c.firstName} {c.lastName}</h2>
                  <p className="text-sm font-semibold text-accent-700">{c.specialization}</p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <Stars value={r.avg} size={14} /> {r.count ? `${r.avg.toFixed(1)} · ${r.count} avis` : "Nouveau"}
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm text-slate-500">{c.bio}</p>
                  <div className="mt-auto space-y-1.5 pt-4 text-sm text-slate-600">
                    <p className="flex items-center gap-2"><Award size={15} className="text-slate-400" /> {c.experience} ans d'expérience</p>
                    {c.languages && <p className="flex items-center gap-2"><Languages size={15} className="text-slate-400" /> {c.languages}</p>}
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-400">Voir le profil <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-16 md:px-8"><AdSlot placement="COACHES" /></div>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <h2 className="text-center text-3xl font-bold text-primary-400">Réserver un cours en 3 étapes</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              [UserCheck, "1. Choisissez votre coach", "Consultez les profils, les spécialités et les avis des membres."],
              [CalendarCheck, "2. Choisissez un créneau", "Le coach est ajouté à votre réservation de court, selon ses disponibilités."],
              [CreditCard, "3. Payez en ligne", "MTN Mobile Money ou carte. Confirmation immédiate par e-mail."],
            ].map(([Icon, title, text]) => {
              const I = Icon as typeof Award;
              return (
                <div key={title as string} className="rounded-2xl bg-white p-6 shadow-soft">
                  <span className="inline-flex rounded-xl bg-accent-400 p-3 text-primary-400"><I size={22} /></span>
                  <h3 className="mt-4 font-bold text-primary-400">{title as string}</h3>
                  <p className="mt-1 text-sm text-slate-500">{text as string}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-10 text-center"><Link href="/dashboard/reservations/new" className="btn-accent px-6 py-3 text-base">Réserver un cours</Link></div>
        </div>
      </section>
    </>
  );
}
