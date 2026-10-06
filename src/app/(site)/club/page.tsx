import Link from "next/link";
import { CheckCircle2, Landmark, Users, Trophy, Accessibility, CalendarDays } from "lucide-react";
import { db } from "@/db";
import { BOARD, FACILITIES, HISTORY, VALUES } from "@/lib/club";
import PageHero, { PageBody, HeroPanel } from "@/components/site/PageHero";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import CountUp from "@/components/motion/CountUp";

export const metadata = { title: "Le club" };

export default async function ClubPage() {
  const courts = db.courts.filter((c) => c.isActive);
  const years = new Date().getFullYear() - 1998;
  const figures = [
    { value: 300, suffix: "+", label: "membres" },
    { value: years, suffix: "", label: "années" },
    { value: 200, suffix: "+", label: "enfants formés" },
  ];
  return (
    <>
      <PageHero
        kicker="Depuis 1998"
        icon={<Landmark size={15} />}
        title="Un club, une famille,"
        accent="une passion"
        text="Le Bénin Tennis Club accueille joueurs de tous âges et de tous niveaux à Akpakpa Dodomey, au cœur de Cotonou."
        image="/images/hero-clay.svg"
        crumbs={[{ href: "/", label: "Accueil" }]}
        aside={
          <HeroPanel
            items={[
              { icon: <Trophy size={18} />, text: "L'Open de Cotonou, rendez-vous du tennis béninois" },
              { icon: <Users size={18} />, text: "Trois générations de joueurs sur nos courts" },
              { icon: <Accessibility size={18} />, text: "Section tennis fauteuil et Court 2 adapté" },
            ]}
          />
        }
      />

      <PageBody>
        {/* Mission + valeurs */}
        <div className="grid gap-8 lg:grid-cols-12">
          <Reveal className="card p-8 md:p-10 lg:col-span-5">
            <p className="eyebrow">Notre raison d'être</p>
            <h2 className="section-title mt-3">Notre mission</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              Rendre le tennis accessible au plus grand nombre au Bénin, former les champions de demain et offrir
              à chaque membre un lieu où progresser, se dépasser et partager.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              {figures.map((f) => (
                <div key={f.label} className="rounded-2xl bg-ink px-2 py-4">
                  <p className="font-display text-2xl font-black text-lime"><CountUp value={f.value} />{f.suffix}</p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-white/60">{f.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
            {VALUES.map((v, i) => (
              <StaggerItem key={v.title}>
                <div className="card-hover group h-full p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mist font-display text-lg font-black text-brand transition-all duration-500 group-hover:-rotate-6 group-hover:bg-brand group-hover:text-white">0{i + 1}</span>
                  <h3 className="mt-5 font-display text-xl font-black text-ink">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{v.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </PageBody>

      {/* Histoire */}
      <section className="relative overflow-hidden bg-ink py-24 text-white md:py-28">
        <div className="court-lines-dark pointer-events-none absolute inset-0 opacity-30" aria-hidden />
        <div aria-hidden className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-lime/15 blur-3xl" />
        <div className="relative mx-auto max-w-content px-6">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-lime">Depuis 1998</p>
            <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-white md:text-5xl">Notre <span className="text-lime">histoire</span></h2>
          </Reveal>
          <Stagger className="mt-14 grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {HISTORY.map((h) => (
              <StaggerItem key={h.year}>
                <div className="relative border-t-2 border-lime/60 pt-6">
                  <span className="absolute -top-[9px] left-0 h-4 w-4 rounded-full bg-lime animate-pulse-dot" />
                  <p className="font-display text-3xl font-black text-lime">{h.year}</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{h.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Installations */}
      <section className="mx-auto max-w-content px-6 py-24 md:py-28">
        <Reveal>
          <p className="eyebrow">Sur place</p>
          <h2 className="section-title mt-3">Nos installations</h2>
        </Reveal>
        <Stagger className="mt-10 grid gap-6 md:grid-cols-3">
          {courts.map((c) => (
            <StaggerItem key={c.id} className="h-full">
              <div className="card-hover group flex h-full flex-col overflow-hidden">
                <div className="relative overflow-hidden">
                  <img src={c.image ?? ""} alt={c.name} className="aspect-[12/7] w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl font-black text-ink">{c.name} · {c.surface}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{c.description}</p>
                  <Link href={`/dashboard/reservations/new?court=${c.id}`} className="btn-primary mt-5 w-full"><CalendarDays size={15} /> Réserver ce court</Link>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FACILITIES.map((f) => (
            <StaggerItem key={f.title}>
              <div className="flex h-full gap-4 rounded-[1.5rem] border border-ink/[0.08] bg-white p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-light text-ink"><CheckCircle2 size={20} /></span>
                <div><p className="font-semibold text-ink">{f.title}</p><p className="mt-0.5 text-sm text-muted">{f.text}</p></div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Bureau */}
      <section className="bg-cloud/60 py-24 md:py-28">
        <div className="mx-auto max-w-content px-6">
          <Reveal>
            <p className="eyebrow">Les bénévoles qui font vivre le club</p>
            <h2 className="section-title mt-3">Le bureau du club</h2>
          </Reveal>
          <Stagger className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4">
            {BOARD.map((b) => (
              <StaggerItem key={b.name}>
                <div className="card-hover h-full p-6 text-center">
                  <img src={b.avatar} alt="" className="mx-auto h-24 w-24 rounded-full object-cover ring-4 ring-lime/60" />
                  <p className="mt-4 font-display text-lg font-black leading-tight text-ink">{b.name}</p>
                  <p className="mt-1 text-sm text-muted">{b.role}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="mt-14">
            <div className="flex flex-wrap items-center justify-between gap-6 rounded-[2rem] bg-lime p-8 md:p-10">
              <div>
                <p className="font-display text-3xl font-black tracking-tight text-ink">Envie de nous rejoindre ?</p>
                <p className="mt-1 text-ink/75">Première séance d'essai offerte.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/tarifs" className="btn bg-white text-ink hover:bg-ink hover:text-white">Voir les tarifs</Link>
                <Link href="/register" className="btn-dark">Devenir membre</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
