import Link from "next/link";
import { Award, Languages, ChevronRight, CalendarCheck, UserCheck, CreditCard, GraduationCap, Star, Users } from "lucide-react";
import { db } from "@/db";
import { xof } from "@/lib/format";
import { coachRatings } from "@/lib/coaches";
import PageHero, { PageBody, HeroPanel } from "@/components/site/PageHero";
import Stars from "@/components/Stars";
import AdSlot from "@/components/AdSlot";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";

export const metadata = { title: "Nos coachs & formateurs" };

const STEPS = [
  { icon: UserCheck, title: "1. Choisissez votre coach", text: "Consultez les profils, les spécialités et les avis des membres." },
  { icon: CalendarCheck, title: "2. Choisissez un créneau", text: "Le coach est ajouté à votre réservation de court, selon ses disponibilités." },
  { icon: CreditCard, title: "3. Payez en ligne", text: "MTN Mobile Money ou carte. Confirmation immédiate par e-mail." },
];

export default async function CoachsPage() {
  const coaches = db.coaches.filter((c) => c.status === "ACTIVE");
  const rating = await coachRatings();

  return (
    <>
      <PageHero
        kicker="L'équipe pédagogique"
        icon={<GraduationCap size={15} />}
        title="Nos coachs"
        accent="& formateurs"
        text="Six professionnels diplômés pour tous les âges et tous les niveaux : de la première balle en mini-tennis jusqu'au circuit ITF."
        image="/images/hero-graphic.svg"
        crumbs={[{ href: "/", label: "Accueil" }]}
        aside={
          <HeroPanel
            items={[
              { icon: <GraduationCap size={18} />, text: "Diplômes d'État et certifications fédérales" },
              { icon: <Users size={18} />, text: "Cours particuliers, à deux ou en groupe" },
              { icon: <Star size={18} />, text: "Avis vérifiés des membres du club" },
            ]}
          />
        }
      />

      <PageBody>
        <Stagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {coaches.map((c) => {
            const r = rating(c.id);
            return (
              <StaggerItem key={c.id} className="h-full">
                <Link href={`/coachs/${c.id}`} className="card-hover group flex h-full flex-col overflow-hidden">
                  <div className="relative overflow-hidden">
                    <img src={c.photo ?? ""} alt={`${c.firstName} ${c.lastName}`} className="aspect-[4/3] w-full object-cover object-top transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
                    <span className="absolute bottom-3 left-4 rounded-full bg-lime px-3 py-1 text-xs font-bold text-ink">{xof(c.hourlyRate)} / h</span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="font-display text-2xl font-black tracking-tight text-ink transition-colors group-hover:text-brand">{c.firstName} {c.lastName}</h2>
                    <p className="eyebrow mt-1.5">{c.specialization}</p>
                    <div className="mt-3 flex items-center gap-2 text-sm text-muted">
                      <Stars value={r.avg} size={14} /> {r.count ? `${r.avg.toFixed(1)} · ${r.count} avis` : "Nouveau"}
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{c.bio}</p>
                    <div className="mt-auto space-y-1.5 pt-5 text-sm text-ink/75">
                      <p className="flex items-center gap-2"><Award size={15} className="text-brand" /> {c.experience} ans d'expérience</p>
                      {c.languages && <p className="flex items-center gap-2"><Languages size={15} className="text-brand" /> {c.languages}</p>}
                    </div>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand">Voir le profil <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" /></span>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal className="mt-14"><AdSlot placement="COACHES" /></Reveal>
      </PageBody>

      <section className="relative overflow-hidden bg-ink py-24 text-white md:py-28">
        <div className="court-lines-dark pointer-events-none absolute inset-0 opacity-30" aria-hidden />
        <div aria-hidden className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-lime/15 blur-3xl" />
        <div className="relative mx-auto max-w-content px-6">
          <Reveal className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-lime">Simple et rapide</p>
            <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-white md:text-5xl">Réserver un cours <span className="text-lime">en 3 étapes</span></h2>
          </Reveal>
          <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map(({ icon: I, title, text }) => (
              <StaggerItem key={title}>
                <div className="h-full rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
                  <span className="inline-flex rounded-2xl bg-lime p-3 text-ink"><I size={22} /></span>
                  <h3 className="mt-5 font-display text-xl font-black text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="mt-12 text-center"><Link href="/dashboard/reservations/new" className="btn-accent">Réserver un cours</Link></Reveal>
        </div>
      </section>
    </>
  );
}
