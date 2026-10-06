import Link from "next/link";
import { and, asc, eq, gte } from "drizzle-orm";
import { CalendarDays, ShoppingBag, Users, Wrench, HeartHandshake, Trophy, ArrowRight } from "lucide-react";
import { db, t } from "@/db";
import { dateFr, xof } from "@/lib/format";
import AdSlot from "@/components/AdSlot";

export const dynamic = "force-dynamic";

const services = [
  { icon: CalendarDays, title: "Réservation de courts", text: "3 courts dont un en terre battue, de 6 h à minuit. Créneaux de 30 minutes.", href: "/dashboard/reservations/new", cta: "Réserver un court" },
  { icon: Trophy, title: "Tournois & stages", text: "Open de Cotonou, tournois nocturnes, stages vacances et école de tennis.", href: "/evenements", cta: "Voir l'agenda" },
  { icon: Users, title: "Coachs diplômés", text: "Cours particuliers ou collectifs avec nos 6 coachs et formateurs.", href: "/coachs", cta: "Découvrir les coachs" },
  { icon: ShoppingBag, title: "Boutique du club", text: "Raquettes, balles, tenues officielles. Paiement MTN Money ou carte.", href: "/dashboard/shop", cta: "Aller à la boutique" },
  { icon: Wrench, title: "Cordage express", text: "Recordage en 48 h, ou en 24 h avec l'option urgente.", href: "/dashboard/stringing", cta: "Déposer une raquette" },
  { icon: HeartHandshake, title: "Collectes", text: "Soutenez l'éclairage des courts, les jeunes talents et l'école de tennis.", href: "/dashboard/fundraising", cta: "Voir les collectes" },
];

export default async function Home() {
    const [courts, events, coaches] = await Promise.all([
    db.query.courts.findMany({ where: eq(t.courts.isActive, true) }),
    db.query.events.findMany({ where: and(gte(t.events.startDate, new Date()), eq(t.events.status, "ACTIVE")), orderBy: asc(t.events.startDate), limit: 3 }),
        db.query.coaches.findMany({ where: eq(t.coaches.status, "ACTIVE"), limit: 4 }),
  ]);

  return (
    <div className="bg-white">
      {/* Hero : écran partagé */}
      <section className="grid bg-primary-400 lg:min-h-[640px] lg:grid-cols-2">
        <div className="flex flex-col justify-center px-4 py-14 md:px-8 lg:py-20 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pr-14">
          <p className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-accent-400">
            <span className="h-px w-10 bg-accent-400" /> Club de tennis · Cotonou
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.05] text-white md:text-6xl">
            Jouez.<br />Progressez.<br /><span className="text-accent-400">Gagnez.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-slate-300">
            Trois courts éclairés, six coachs et formateurs diplômés et toute la vie du club dans une seule application :
            réservation, tournois, boutique, paiement MTN Mobile Money ou carte.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard/reservations/new" className="btn-accent px-6 py-3 text-base">
              Réserver un court <ArrowRight size={18} />
            </Link>
            <Link href="/evenements" className="btn border border-white/25 px-6 py-3 text-base text-white hover:bg-white/10">
              Voir les événements
            </Link>
          </div>
          <dl className="mt-12 grid max-w-md grid-cols-3 divide-x divide-white/15 border-t border-white/15 pt-6">
            {[["3", "courts"], ["6h–24h", "chaque jour"], ["300+", "membres"]].map(([v, l]) => (
              <div key={l} className="px-4 first:pl-0">
                <dt className="whitespace-nowrap text-xl font-extrabold text-white sm:text-2xl">{v}</dt>
                <dd className="text-xs uppercase tracking-wider text-slate-400">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative min-h-[320px] overflow-hidden">
          <img src="/images/hero.svg" alt="Court du Bénin Tennis Club" className="absolute inset-0 h-full w-full object-cover" />
          {(() => {
            const next = events.find((e) => e.type === "TOURNAMENT") ?? events[0];
            return next ? (
              <Link href={`/evenements/${next.id}`} className="group absolute bottom-6 left-6 flex items-center gap-4 rounded-2xl bg-white/95 p-4 shadow-medium backdrop-blur transition hover:bg-white">
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Prochain tournoi · {dateFr(next.startDate, { day: "numeric", month: "long" })}</span>
                  <span className="block font-bold text-primary-400">{next.title}</span>
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-400 text-primary-400 transition group-hover:translate-x-1"><ArrowRight size={16} /></span>
              </Link>
            ) : null;
          })()}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <h2 className="text-center text-3xl font-bold text-primary-400">Tout le club dans une seule application</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-500">Une plateforme pour les adhérents, les parents, les coachs et l'équipe du club.</p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ icon: Icon, title, text, href, cta }) => (
            <Link key={title} href={href} className="card group flex flex-col p-6 transition hover:-translate-y-1 hover:border-accent-400 hover:shadow-medium">
              <span className="inline-flex rounded-xl bg-accent-100 p-3 text-primary-400 transition group-hover:bg-accent-400">
                <Icon size={22} />
              </span>
              <h3 className="mt-4 text-lg font-bold text-primary-400">{title}</h3>
              <p className="mt-2 flex-1 text-sm text-slate-500">{text}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-400">{cta} <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </section>

      {/* Courts */}
      <section id="courts" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-bold text-primary-400">Nos courts</h2>
            <Link href="/tarifs" className="btn-ghost">Voir tous les tarifs <ArrowRight size={16} /></Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {courts.map((c) => (
              <div key={c.id} className="card flex flex-col overflow-hidden">
                <Link href={`/dashboard/reservations/new?court=${c.id}`}><img src={c.image ?? ""} alt={`Réserver le ${c.name}`} className="aspect-[12/7] w-full object-cover transition hover:opacity-90" /></Link>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-primary-400">{c.name}</h3>
                    <span className="chip bg-accent-100 text-primary-400">{xof(c.pricePerSlot * 2)} / h</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-600">{c.surface}</p>
                  <p className="mt-2 flex-1 text-sm text-slate-500">{c.description}</p>
                  <Link href={`/dashboard/reservations/new?court=${c.id}`} className="btn-accent mt-4 w-full">Réserver ce court</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coachs */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-700">L'équipe pédagogique</p>
            <h2 className="mt-2 text-3xl font-bold text-primary-400">Nos coachs & formateurs</h2>
          </div>
          <Link href="/coachs" className="btn-ghost">Voir toute l'équipe <ArrowRight size={16} /></Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {coaches.map((c) => (
            <Link key={c.id} href={`/coachs/${c.id}`} className="group overflow-hidden rounded-2xl bg-slate-50 transition hover:-translate-y-1 hover:shadow-medium">
              <img src={c.photo ?? ""} alt={`${c.firstName} ${c.lastName}`} className="aspect-square w-full object-cover" />
              <div className="p-4">
                <p className="font-bold text-primary-400 group-hover:underline">{c.firstName} {c.lastName}</p>
                <p className="text-sm text-slate-500">{c.specialization}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-400">Voir le profil <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Espace partenaire */}
      <div className="mx-auto max-w-7xl px-4 md:px-8"><AdSlot placement="HOME" /></div>

      {/* Événements */}
      <section id="events" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-bold text-primary-400">Prochains événements</h2>
          <Link href="/evenements" className="btn-ghost">Tout l'agenda <ArrowRight size={16} /></Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {events.map((e) => (
            <Link key={e.id} href={`/evenements/${e.id}`} className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-medium">
              <img src={e.image ?? ""} alt="" className="aspect-[2/1] w-full object-cover" />
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent-700">{dateFr(e.startDate)}</p>
                <h3 className="mt-1 text-lg font-bold text-primary-400 group-hover:underline">{e.title}</h3>
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-500">{e.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-primary-400">{e.price ? xof(e.price) : "Gratuit"}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-400">Voir le détail <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>


    </div>
  );
}
