import Link from "next/link";
import {
  ShoppingBag, Users, Wrench, HeartHandshake, Trophy, ArrowRight, ChevronRight, Sparkles,
  Check, MapPin, Phone, Mail, Clock, MessageCircle, Megaphone, Quote,
} from "lucide-react";
import { db } from "@/db";
import { sortBy } from "@/db/relations";
import { dateFr, xof } from "@/lib/format";
import { getClubInfo, getMemberships } from "@/lib/settings";
import AdSlot from "@/components/AdSlot";
import CountUp from "@/components/motion/CountUp";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import HomeHero from "./_home/HomeHero";

export const dynamic = "force-dynamic";

/* Trois grandes activités, en sections alternées (image découpée en biais) */
const SPLITS = [
  {
    tag: "Réservation de courts",
    title: "Votre court, à l'heure qui vous va.",
    text: "3 courts dont un en terre battue, de 6 h à minuit. Créneaux de 30 minutes, réservés et payés en ligne en moins de deux minutes.",
    image: "/images/hero-night.svg",
    alt: "Court éclairé du club en soirée",
    href: "/dashboard/reservations/new",
    cta: "Réserver un court",
  },
  {
    tag: "Coachs diplômés",
    title: "Un coach qui connaît votre jeu.",
    text: "Cours particuliers ou collectifs avec nos 6 coachs et formateurs : mini-tennis, perfectionnement, compétition ou tennis fauteuil.",
    image: "/images/events/school.svg",
    alt: "Séance d'entraînement avec un coach du club",
    href: "/coachs",
    cta: "Découvrir les coachs",
  },
  {
    tag: "Tournois & stages",
    title: "Un agenda qui fait vivre le club.",
    text: "Open de Cotonou, tournois nocturnes, stages vacances et école de tennis : inscription en ligne, paiement MTN Money ou carte.",
    image: "/images/events/night-tournament.svg",
    alt: "Tournoi nocturne sur les courts du club",
    href: "/evenements",
    cta: "Voir l'agenda",
  },
];

/* Les autres services du club */
const EXTRAS = [
  { icon: ShoppingBag, title: "Boutique du club", text: "Raquettes, balles, tenues officielles. Paiement MTN Money ou carte.", href: "/dashboard/shop", cta: "Aller à la boutique" },
  { icon: Wrench, title: "Cordage express", text: "Recordage en 48 h, ou en 24 h avec l'option urgente.", href: "/dashboard/stringing", cta: "Déposer une raquette" },
  { icon: HeartHandshake, title: "Collectes", text: "Soutenez l'éclairage des courts, les jeunes talents et l'école de tennis.", href: "/dashboard/fundraising", cta: "Voir les collectes" },
];

const GALLERY = [
  { src: "/images/hero-clay.svg", label: "Terre battue" },
  { src: "/images/events/stage.svg", label: "Stages" },
  { src: "/images/events/gathering.svg", label: "Soirées du club" },
  { src: "/images/events/tournament.svg", label: "Compétition" },
];

/** Heure du club (Cotonou) : ouvert de 6 h à minuit */
function clubOpenNow() {
  const h = Number(new Intl.DateTimeFormat("fr-FR", { hour: "numeric", hour12: false, timeZone: "Africa/Porto-Novo" }).format(new Date()));
  return h >= 6 && h < 24;
}

export default async function Home() {
  const now = new Date();
  const courts = db.courts.filter((c) => c.isActive);
  const events = sortBy(db.events.filter((e) => e.startDate >= now && e.status === "ACTIVE"), "startDate", "asc").slice(0, 3);
  const activeCoaches = db.coaches.filter((c) => c.status === "ACTIVE");
  const coaches = activeCoaches.slice(0, 4);
  const [info, memberships] = await Promise.all([getClubInfo(), getMemberships()]);
  const next = events.find((e) => e.type === "TOURNAMENT") ?? events[0];
  const years = now.getFullYear() - 1998;

  const stats = [
    { value: courts.length, suffix: "", label: "Courts éclairés, dont un en terre battue" },
    { value: activeCoaches.length, suffix: "", label: "Coachs & formateurs diplômés" },
    { value: 300, suffix: "+", label: "Membres et leurs familles" },
    { value: years, suffix: " ans", label: "De tennis à Akpakpa Dodomey" },
  ];

  return (
    <div className="overflow-x-clip">
      {/* ------------------------------ HERO ------------------------------ */}
      <HomeHero
        open={clubOpenNow()}
        hours={info.hours}
        address={info.address}
        nextEvent={next ? { id: next.id, title: next.title, date: dateFr(next.startDate, { day: "numeric", month: "long" }) } : null}
      />

      {/* ------------------------------ BANDE DE CHIFFRES ------------------------------ */}
      <section className="relative z-10 -mt-12 md:-mt-16">
        <div className="mx-auto max-w-content px-6">
          <Reveal y={40}>
            <div className="grid grid-cols-2 divide-x divide-y divide-ink/[0.08] overflow-hidden rounded-[2.5rem] border border-ink/5 bg-white shadow-xl shadow-ink/5 md:grid-cols-4 md:divide-y-0">
              {stats.map((s) => (
                <div key={s.label} className="group p-6 text-center transition-colors hover:bg-mist md:p-8">
                  <p className="mb-1 font-display text-3xl font-black tracking-tight text-brand transition-transform duration-300 group-hover:scale-110 md:text-4xl">
                    <CountUp value={s.value} duration={1.6} />{s.suffix}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ink/55">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------ BANDEAU ESSAI ------------------------------ */}
      <section className="mx-auto max-w-content px-6 pt-8">
        <Reveal>
          <Link href="/contact?sujet=Séance" className="group flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-ink/10 bg-white p-6 transition-colors hover:border-brand/40">
            <span className="flex items-center gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime/30 text-ink transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110"><Sparkles size={20} /></span>
              <span>
                <span className="block font-display text-lg font-black leading-tight text-ink">Jamais venu au club ?</span>
                <span className="text-sm text-muted">Une heure de court et le prêt de raquette offerts pour votre première visite.</span>
              </span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand">
              Réserver mon essai <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </Reveal>
      </section>

      {/* ------------------------------ NOS COURTS ------------------------------ */}
      <section id="courts" className="mx-auto max-w-content px-6 pb-6 pt-20 md:pb-8 md:pt-24">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Nos courts</p>
            <h2 className="section-title mt-3">Choisissez votre surface.</h2>
          </div>
          <Link href="/tarifs" className="group inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-bold uppercase tracking-widest text-brand hover:text-ink">
            Voir tous les tarifs <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courts.map((c) => (
            <StaggerItem key={c.id} className="h-full">
              <div className="card-hover group flex h-full flex-col overflow-hidden">
                <Link href={`/dashboard/reservations/new?court=${c.id}`} className="relative block h-52 overflow-hidden">
                  <img src={c.image ?? ""} alt={`Réserver le ${c.name}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <span className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
                  <span className="absolute bottom-3 left-4 rounded-full bg-lime px-3 py-1 text-xs font-bold text-ink">{xof(c.pricePerSlot * 2)} / h</span>
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl font-black text-ink">{c.name}</h3>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-brand"><MapPin size={14} /> {c.surface}</p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{c.description}</p>
                  <Link href={`/dashboard/reservations/new?court=${c.id}`} className="btn-primary mt-5 w-full">Réserver ce court</Link>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ------------------------------ ESPACE PARTENAIRE ------------------------------ */}
      <section className="mx-auto max-w-content px-6 pt-10">
        <Reveal><AdSlot placement="HOME" /></Reveal>
      </section>

      {/* ------------------------------ ACTIVITÉS — SPLITS ALTERNÉS ------------------------------ */}
      <section id="activites" className="space-y-24 pb-20 pt-20 md:space-y-28 md:pb-24 md:pt-28">
        {SPLITS.map((a, i) => {
          const flip = i % 2 === 1;
          return (
            <div key={a.tag}>
              <div className={`mx-auto grid max-w-content grid-cols-1 items-center gap-10 px-6 lg:grid-cols-12 lg:gap-12 ${flip ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <Reveal x={flip ? 40 : -40} y={0} className="lg:col-span-5">
                  <p className="eyebrow">{a.tag}</p>
                  <h2 className="mb-6 mt-4 font-display text-3xl font-black leading-tight tracking-tight text-ink md:text-4xl">{a.title}</h2>
                  <p className="mb-8 leading-relaxed text-muted">{a.text}</p>
                  <Link href={a.href} className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:text-brand">
                    {a.cta} <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </Reveal>
                <Reveal y={30} className="lg:col-span-7">
                  <div
                    className="group relative aspect-[16/10] overflow-hidden bg-cloud"
                    style={{ clipPath: flip ? "polygon(0 0, 100% 0, 94% 100%, 0% 100%)" : "polygon(0 0, 100% 0, 100% 100%, 6% 100%)" }}
                  >
                    <img src={a.image} alt={a.alt} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                </Reveal>
              </div>

              {/* Coachs, sous la section coaching */}
              {i === 1 && coaches.length > 0 && (
                <div className="mx-auto mt-14 max-w-content px-6">
                  <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="eyebrow">L'équipe pédagogique</p>
                      <h3 className="section-title mt-3">Nos coachs & formateurs</h3>
                    </div>
                    <Link href="/coachs" className="group inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-bold uppercase tracking-widest text-brand hover:text-ink">
                      Voir toute l'équipe <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Reveal>
                  <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {coaches.map((c) => (
                      <StaggerItem key={c.id} className="h-full">
                        <Link href={`/coachs/${c.id}`} className="card-hover group flex h-full flex-col overflow-hidden">
                          <div className="overflow-hidden">
                            <img src={c.photo ?? ""} alt={`${c.firstName} ${c.lastName}`} className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          </div>
                          <div className="flex flex-1 flex-col p-5">
                            <p className="font-display text-lg font-black text-ink transition-colors group-hover:text-brand">{c.firstName} {c.lastName}</p>
                            <p className="mt-0.5 flex-1 text-sm text-muted">{c.specialization}</p>
                            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand">Voir le profil <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" /></span>
                          </div>
                        </Link>
                      </StaggerItem>
                    ))}
                  </Stagger>
                </div>
              )}

              {/* Prochains événements, sous la section agenda */}
              {i === 2 && (
                <div id="events" className="mx-auto mt-14 max-w-content scroll-mt-24 px-6">
                  <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="eyebrow">À l'agenda</p>
                      <h3 className="section-title mt-3">Prochains événements</h3>
                    </div>
                    <Link href="/evenements" className="group inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-bold uppercase tracking-widest text-brand hover:text-ink">
                      Tout l'agenda <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Reveal>
                  {events.length === 0 ? (
                    <div className="card p-10 text-center text-muted">Aucun événement à venir pour le moment.</div>
                  ) : (
                    <Stagger className="grid gap-6 md:grid-cols-3">
                      {events.map((e) => (
                        <StaggerItem key={e.id} className="h-full">
                          <Link href={`/evenements/${e.id}`} className="card-hover group flex h-full flex-col overflow-hidden">
                            <div className="relative overflow-hidden">
                              <img src={e.image ?? ""} alt="" className="aspect-[2/1] w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                              <span className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
                            </div>
                            <div className="flex flex-1 flex-col p-6">
                              <p className="eyebrow">{dateFr(e.startDate)}</p>
                              <h4 className="mt-2 font-display text-xl font-black leading-tight text-ink transition-colors group-hover:text-brand">{e.title}</h4>
                              <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">{e.description}</p>
                              <div className="mt-5 flex items-center justify-between gap-3">
                                <span className="font-display text-lg font-black text-ink">{e.price ? xof(e.price) : "Gratuit"}</span>
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand">Voir le détail <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></span>
                              </div>
                            </div>
                          </Link>
                        </StaggerItem>
                      ))}
                    </Stagger>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* ------------------------------ ET AUSSI — LIENS RAPIDES ------------------------------ */}
      <section className="mx-auto max-w-content px-6 pb-20 md:pb-24">
        <Reveal>
          <div className="rounded-[2rem] border border-ink/10 bg-white p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm font-semibold text-muted">Et aussi : la boutique, l'atelier cordage et les collectes du club, depuis votre espace membre.</p>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {[["/tarifs", "Tarifs"], ["/club", "Le club"], ["/contact", "Contact"]].map(([href, label]) => (
                  <Link key={href} href={href} className="inline-flex items-center gap-1.5 text-sm font-bold text-ink underline decoration-ink/30 decoration-2 underline-offset-4 transition-colors hover:text-brand hover:decoration-brand">
                    {label} <span aria-hidden>→</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-6 grid gap-4 border-t border-ink/[0.06] pt-6 md:grid-cols-3">
              {EXTRAS.map(({ icon: Icon, title, text, href, cta }) => (
                <Link key={title} href={href} className="group flex gap-4 rounded-[1.5rem] p-3 transition-colors hover:bg-mist">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mist text-brand transition-all duration-500 group-hover:-rotate-6 group-hover:bg-brand group-hover:text-white"><Icon size={20} /></span>
                  <span className="min-w-0">
                    <span className="block font-display text-lg font-black text-ink">{title}</span>
                    <span className="mt-0.5 block text-sm text-muted">{text}</span>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-brand">{cta} <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" /></span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ------------------------------ GALERIE ------------------------------ */}
      <section id="galerie" className="pb-24 md:pb-28">
        <Reveal className="mx-auto mb-10 max-w-content px-6">
          <p className="eyebrow">L'ambiance</p>
          <h2 className="section-title mt-3">L'esprit du club, de 6 h à minuit.</h2>
        </Reveal>
        <Stagger className="mx-auto grid max-w-content grid-cols-2 gap-4 px-6 md:grid-cols-4 md:gap-5">
          {GALLERY.map((g) => (
            <StaggerItem key={g.label}>
              <div className="group relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-cloud transition-transform duration-500 hover:-translate-y-2">
                <img src={g.src} alt={g.label} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <span className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                <span className="absolute bottom-4 left-4 rounded-full bg-ink/50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">{g.label}</span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ------------------------------ CITATION SUR FOND CITRON ------------------------------ */}
      <section className="bg-lime py-24 md:py-28">
        <Reveal className="mx-auto max-w-4xl px-6 text-center">
          <Quote size={36} className="mx-auto mb-8 animate-float text-ink" aria-hidden />
          <p className="font-display text-2xl font-black leading-tight tracking-tight text-ink md:text-4xl">
            « Ici, on apprend d'abord à tenir une raquette, puis à serrer la main de son adversaire.
            Le score compte, mais c'est le respect qui fait un joueur. »
          </p>
          <p className="mt-8 text-xs font-bold uppercase tracking-widest text-ink/70">— Carine Adjovi, directrice sportive du club</p>
        </Reveal>
      </section>

      {/* ------------------------------ DEVENIR PARTENAIRE ------------------------------ */}
      <section className="relative overflow-hidden bg-ink py-24 text-white md:py-28">
        <div className="court-lines-dark pointer-events-none absolute inset-0 opacity-30" aria-hidden />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-lime/15 blur-3xl" />
        <div className="relative mx-auto grid max-w-content grid-cols-1 items-center gap-14 px-6 lg:grid-cols-12">
          <Reveal x={-40} y={0} className="lg:col-span-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-lime">Entreprises & mécènes</p>
            <h2 className="mb-8 mt-5 font-display text-4xl font-black leading-[0.95] tracking-tight text-white md:text-6xl">
              Votre marque <br /> <span className="text-lime">au bord du court.</span>
            </h2>
            <p className="mb-10 max-w-md text-lg leading-relaxed text-white/65">
              Bannières sur le site, panneaux sur les courts, nom associé à l'Open de Cotonou : soutenez le tennis
              béninois et touchez une communauté fidèle.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/50">Audience</p>
                <p className="font-display text-xl font-black text-white">300+ membres et familles</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/50">Rendez-vous</p>
                <p className="font-display text-xl font-black text-lime">5 événements par an</p>
              </div>
            </div>
          </Reveal>
          <Reveal x={40} y={0} delay={0.1} className="lg:col-span-5">
            <div className="rounded-[3rem] border border-white/10 bg-white/5 p-8 text-center backdrop-blur-2xl md:p-10">
              <Megaphone size={32} className="mx-auto mb-6 text-lime" />
              <h3 className="mb-4 font-display text-2xl font-black uppercase tracking-tight text-white">Devenir partenaire</h3>
              <p className="mb-8 text-sm leading-relaxed text-white/65">Quatre formules, de Partenaire à Platine. Affichages et clics mesurés pour chaque bannière.</p>
              <Link href="/partenaires#devenir-partenaire" className="btn-accent w-full">Voir les offres partenaires</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------ FORMULES D'ADHÉSION ------------------------------ */}
      <section id="formules" className="py-24 md:py-28">
        <div className="mx-auto max-w-content px-6">
          <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Adhésion annuelle</p>
              <h2 className="section-title mt-3">Une formule pour chaque joueur.</h2>
            </div>
            <Link href="/tarifs" className="group inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-bold uppercase tracking-widest text-brand hover:text-ink">
              Tous les tarifs <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
          <Stagger className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {memberships.map((m) => (
              <StaggerItem key={m.name} className="h-full">
                <div className={`group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] p-8 transition-all duration-300 hover:-translate-y-1 ${m.highlight ? "bg-ink text-white shadow-xl shadow-ink/25" : "border border-ink/[0.08] bg-white shadow-sm hover:shadow-xl hover:shadow-brand/10"}`}>
                  {m.highlight && <div aria-hidden className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-lime/20 blur-3xl" />}
                  <span className={`relative flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500 group-hover:-rotate-6 ${m.highlight ? "bg-lime text-ink" : "bg-mist text-brand group-hover:bg-brand group-hover:text-white"}`}>
                    {m.highlight ? <Trophy size={22} /> : <Users size={22} />}
                  </span>
                  <p className={`relative mt-6 text-[11px] font-bold uppercase tracking-[0.2em] ${m.highlight ? "text-lime" : "text-brand"}`}>{m.tag}</p>
                  <h3 className={`relative mt-1 font-display text-2xl font-black tracking-tight ${m.highlight ? "text-white" : "text-ink"}`}>{m.name}</h3>
                  <p className="relative mt-2">
                    <span className={`font-display text-2xl font-black ${m.highlight ? "text-white" : "text-ink"}`}>{xof(m.price)}</span>
                    <span className={m.highlight ? "text-white/60" : "text-muted"}> / {m.period}</span>
                  </p>
                  <ul className="relative mt-5 flex-1 space-y-2 text-sm">
                    {m.perks.slice(0, 3).map((p) => (
                      <li key={p} className="flex gap-2"><Check size={17} className={`shrink-0 ${m.highlight ? "text-lime" : "text-brand"}`} /><span className={m.highlight ? "text-white/80" : "text-ink/75"}>{p}</span></li>
                    ))}
                  </ul>
                  <Link href="/register" className={`${m.highlight ? "btn-accent" : "btn-ghost"} relative mt-7 w-full`}>Choisir {m.name}</Link>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ------------------------------ CONTACT ------------------------------ */}
      <section id="contact" className="pb-24 md:pb-28">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="relative grid grid-cols-1 gap-10 overflow-hidden rounded-[2.5rem] bg-ink p-8 text-white sm:p-12 md:grid-cols-2 md:rounded-[3.5rem] md:p-16">
              <div className="court-lines-dark pointer-events-none absolute inset-0 opacity-30" aria-hidden />
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-lime/15 blur-3xl" aria-hidden />
              <div className="relative">
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-lime">Nous trouver</p>
                <h2 className="mb-6 mt-3 font-display text-3xl font-black tracking-tight text-white md:text-4xl">Passez nous voir au club.</h2>
                <p className="mb-8 leading-relaxed text-white/65">Adhésion, cours, privatisation d'un court ou simple question : l'accueil vous répond tous les jours.</p>
                <ul className="space-y-3 text-sm font-semibold">
                  <li className="flex items-start gap-3"><MapPin size={16} className="mt-0.5 shrink-0 text-lime" /> <span>{info.address}<span className="block text-xs font-medium text-white/55">{info.addressHint}</span></span></li>
                  <li className="flex items-center gap-3"><Phone size={16} className="shrink-0 text-lime" /> {info.phone}</li>
                  <li className="flex items-center gap-3"><MessageCircle size={16} className="shrink-0 text-lime" /> {info.whatsapp}</li>
                  <li className="flex items-center gap-3 break-all"><Mail size={16} className="shrink-0 text-lime" /> {info.email}</li>
                  <li className="flex items-center gap-3"><Clock size={16} className="shrink-0 text-lime" /> {info.hours}</li>
                </ul>
              </div>
              <div className="relative flex flex-col justify-between gap-6">
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10">
                  <img src="/images/courts/court-2.svg" alt="Les courts du Bénin Tennis Club" className="aspect-[4/3] w-full object-cover opacity-70" />
                  <span className="absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-lime px-4 py-2 text-sm font-bold text-ink shadow-xl">
                    <MapPin size={16} /> Bénin Tennis Club
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/contact" className="btn-accent flex-1">Nous écrire <ArrowRight size={16} /></Link>
                  <a href={`tel:${info.phone.replace(/\s/g, "")}`} className="btn-ghost-dark flex-1"><Phone size={16} /> Appeler</a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
