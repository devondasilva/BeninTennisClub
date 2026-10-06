import Link from "next/link";
import { CalendarDays, MapPin, Users, ArrowRight, Trophy, Ticket, Smartphone, Medal } from "lucide-react";
import { db } from "@/db";
import { sortBy } from "@/db/relations";
import { dateFr, timeFr, xof } from "@/lib/format";
import PageHero, { PageBody, HeroPanel } from "@/components/site/PageHero";
import AdSlot from "@/components/AdSlot";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";

export const metadata = { title: "Événements" };

const TYPES: Record<string, string> = { TOURNAMENT: "Tournoi", STAGE: "Stage", SCHOOL: "École de tennis", GATHERING: "Convivialité" };

export default async function PublicEventsPage() {
  const now = new Date();
  const events = sortBy(db.events.filter((e) => e.endDate >= now && e.status === "ACTIVE"), "startDate", "asc");
  const confirmed = (eventId: string) => db.eventRegistrations.count((r) => r.eventId === eventId && r.status === "CONFIRMED");
  const [first, ...rest] = events;

  return (
    <>
      <PageHero
        kicker="Agenda du club"
        icon={<CalendarDays size={15} />}
        title="Tournois, stages"
        accent="& soirées"
        text="Inscrivez-vous en ligne en quelques clics, paiement MTN Mobile Money ou carte."
        image="/images/events/tournament.svg"
        crumbs={[{ href: "/", label: "Accueil" }]}
        aside={
          <HeroPanel
            items={[
              { icon: <Ticket size={18} />, text: <><b className="text-lime">01</b> Choisissez votre tournoi, stage ou soirée</> },
              { icon: <Smartphone size={18} />, text: <><b className="text-lime">02</b> Payez en MTN Mobile Money ou par carte</> },
              { icon: <Medal size={18} />, text: <><b className="text-lime">03</b> Recevez votre confirmation par e-mail</> },
            ]}
          />
        }
      />

      <PageBody>
        {first ? (
          <Reveal>
            <div className="group relative grid overflow-hidden rounded-[2rem] bg-ink shadow-xl shadow-ink/20 md:grid-cols-2">
              <Link href={`/evenements/${first.id}`} className="relative block min-h-[260px] overflow-hidden" tabIndex={-1} aria-hidden>
                <img src={first.image ?? ""} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </Link>
              <div className="relative p-8 md:p-10">
                <div className="court-lines-dark pointer-events-none absolute inset-0 opacity-30" aria-hidden />
                <div aria-hidden className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-lime/15 blur-3xl" />
                <div className="relative">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-lime px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-ink">
                    <Trophy size={13} /> À la une · {TYPES[first.type]}
                  </span>
                  <h2 className="mt-5 font-display text-3xl font-black leading-tight tracking-tight text-white md:text-4xl">{first.title}</h2>
                  <p className="mt-3 line-clamp-4 leading-relaxed text-white/70">{first.description}</p>
                  <div className="mt-6 space-y-2 text-sm text-white/80">
                    <p className="flex items-center gap-2.5"><CalendarDays size={16} className="text-lime" /> <span className="first-letter:uppercase">{dateFr(first.startDate, { weekday: "long", day: "numeric", month: "long" })} · {timeFr(first.startDate)}</span></p>
                    <p className="flex items-center gap-2.5"><MapPin size={16} className="text-lime" /> {first.location}</p>
                  </div>
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link href={`/evenements/${first.id}`} className="btn-accent">Voir le détail et s'inscrire <ArrowRight size={16} /></Link>
                    <span className="font-display text-xl font-black text-white">{first.price ? xof(first.price) : "Gratuit"}</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        ) : (
          <div className="card p-12 text-center text-muted">Aucun événement à venir pour le moment. Revenez bientôt !</div>
        )}

        <Reveal className="mt-10"><AdSlot placement="EVENTS" /></Reveal>

        {rest.length > 0 && (
          <>
            <Reveal className="mt-16">
              <p className="eyebrow">Prochainement</p>
              <h2 className="section-title mt-3">Le reste de l'agenda.</h2>
            </Reveal>
            <Stagger className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((e) => {
                const left = Math.max(0, e.capacity - confirmed(e.id));
                return (
                  <StaggerItem key={e.id} className="h-full">
                    <div className="card-hover group flex h-full flex-col overflow-hidden">
                      <Link href={`/evenements/${e.id}`} className="relative block overflow-hidden" tabIndex={-1} aria-hidden>
                        <img src={e.image ?? ""} alt="" className="aspect-[2/1] w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
                        <span className="absolute bottom-3 left-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-ink">{TYPES[e.type]}</span>
                      </Link>
                      <div className="flex flex-1 flex-col p-6">
                        <p className="eyebrow">{dateFr(e.startDate, { day: "numeric", month: "long" })}</p>
                        <Link href={`/evenements/${e.id}`} className="mt-2 font-display text-xl font-black leading-tight text-ink hover:text-brand">{e.title}</Link>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{e.description}</p>
                        <p className="mt-3 flex items-center gap-2 text-sm text-muted"><Users size={15} className="text-brand" /> {left} places restantes</p>
                        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                          <span className="font-display text-lg font-black text-ink">{e.price ? xof(e.price) : "Gratuit"}</span>
                          <Link href={`/evenements/${e.id}`} className="btn-primary btn-sm">Voir le détail <ArrowRight size={14} /></Link>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </>
        )}
      </PageBody>
    </>
  );
}
