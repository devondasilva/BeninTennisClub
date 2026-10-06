import Link from "next/link";
import { Check, ExternalLink, Eye, Users, Trophy, Megaphone, Handshake, BarChart3 } from "lucide-react";
import { db } from "@/db";
import { sortBy } from "@/db/relations";
import { xof } from "@/lib/format";
import { activeFilter, partnerClickUrl, partnerImage, TIERS } from "@/lib/partners";
import PageHero, { PageBody, HeroPanel } from "@/components/site/PageHero";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";

export const metadata = { title: "Partenaires" };

const OFFERS = [
  { tier: "PLATINUM", price: 5000000, perks: ["Bannière sur tous les emplacements, diffusion prioritaire", "Nom associé à l'Open de Cotonou", "Logo sur les tenues des équipes du club", "4 courts privatisés par an pour vos équipes"] },
  { tier: "GOLD", price: 2500000, perks: ["Bannière sur l'accueil, les événements et l'espace membre", "Logo sur les panneaux des courts", "2 courts privatisés par an"] },
  { tier: "SILVER", price: 1000000, perks: ["Bannière sur les événements et la boutique", "Logo dans le bandeau partenaires du site"] },
  { tier: "PARTNER", price: 400000, perks: ["Bannière sur la boutique ou l'espace membre", "Logo dans le bandeau partenaires", "Offre réservée aux adhérents mise en avant"] },
];

const AUDIENCE = [
  { icon: Users, v: "300+ membres", l: "et leurs familles, chaque semaine au club" },
  { icon: Eye, v: "30 000+ affichages", l: "de bannières par an sur le site et l'application" },
  { icon: Trophy, v: "5 événements", l: "par an, dont l'Open de Cotonou" },
];

export default async function PartnersPublicPage() {
  const partners = sortBy(db.partners.filter(activeFilter()), "amount", "desc");
  return (
    <>
      <PageHero
        kicker="Ils nous font confiance"
        icon={<Handshake size={15} />}
        title="Nos"
        accent="partenaires"
        text="Le club grandit grâce aux entreprises qui soutiennent le tennis au Bénin. Merci à elles !"
        image="/images/events/tournament.svg"
        crumbs={[{ href: "/", label: "Accueil" }]}
        aside={
          <HeroPanel
            items={[
              { icon: <Megaphone size={18} />, text: "Bannières sur le site et l'espace membre" },
              { icon: <Trophy size={18} />, text: "Visibilité sur les tournois du club" },
              { icon: <BarChart3 size={18} />, text: "Affichages et clics mesurés pour chaque partenaire" },
            ]}
          />
        }
      >
        <a href="#devenir-partenaire" className="btn-accent">Devenir partenaire</a>
      </PageHero>

      <PageBody>
        {partners.length === 0 && <div className="card p-12 text-center text-muted">Aucun partenaire pour le moment.</div>}
        <Stagger className="grid gap-6 md:grid-cols-2">
          {partners.map((p) => {
            const logo = partnerImage(p, "logo"), tier = TIERS[p.tier];
            return (
              <StaggerItem key={p.id} className="h-full">
                <article id={p.id} className="card-hover flex h-full scroll-mt-24 flex-col gap-5 p-6 sm:flex-row md:p-7">
                  <div className="flex h-28 w-full shrink-0 items-center justify-center rounded-2xl bg-mist p-4 sm:w-36">
                    {logo ? <img src={logo} alt={p.name} className="max-h-full max-w-full object-contain" /> : <span className="font-display font-black text-ink">{p.name}</span>}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className={`chip w-fit font-bold ${tier?.color ?? ""}`}>Partenaire {tier?.label}</span>
                    <h2 className="mt-3 font-display text-xl font-black text-ink">{p.name}</h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.description}</p>
                    {p.website && (
                      <a href={partnerClickUrl(p.id)} target="_blank" rel="noopener sponsored" className="group mt-auto inline-flex w-fit items-center gap-1.5 pt-4 text-xs font-bold uppercase tracking-widest text-brand hover:text-ink">
                        Visiter le site <ExternalLink size={14} className="transition-transform group-hover:translate-x-0.5" />
                      </a>
                    )}
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </PageBody>

      <section id="devenir-partenaire" className="relative scroll-mt-20 overflow-hidden bg-ink py-24 text-white md:py-28">
        <div className="court-lines-dark pointer-events-none absolute inset-0 opacity-30" aria-hidden />
        <div aria-hidden className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-lime/15 blur-3xl" />
        <div className="relative mx-auto max-w-content px-6">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-lime">Devenir partenaire</p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl font-black leading-[0.98] tracking-tight text-white md:text-6xl">Associez votre marque <span className="text-lime">au tennis béninois</span></h2>
          </Reveal>
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-3">
            {AUDIENCE.map(({ icon: I, v, l }) => (
              <StaggerItem key={v}>
                <div className="flex h-full items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lime/15 text-lime"><I size={24} /></span>
                  <div><p className="font-display text-xl font-black text-white">{v}</p><p className="text-sm text-white/60">{l}</p></div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <Stagger className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {OFFERS.map((o) => {
              const gold = o.tier === "GOLD";
              return (
                <StaggerItem key={o.tier} className="h-full">
                  <div className={`flex h-full flex-col rounded-[2rem] p-7 transition-transform duration-300 hover:-translate-y-1 ${gold ? "bg-lime text-ink" : "bg-white text-ink"}`}>
                    <span className={`chip w-fit font-bold ${TIERS[o.tier].color}`}>{TIERS[o.tier].label}</span>
                    <p className={`mt-5 text-sm ${gold ? "text-ink/70" : "text-muted"}`}>à partir de</p>
                    <p className="font-display text-2xl font-black tracking-tight text-ink">{xof(o.price)}<span className={`font-body text-sm font-medium ${gold ? "text-ink/70" : "text-muted"}`}> / an</span></p>
                    <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                      {o.perks.map((p) => <li key={p} className="flex gap-2 text-ink/80"><Check size={17} className="shrink-0 text-brand-dark" /> {p}</li>)}
                    </ul>
                    <Link href="/contact?sujet=Partenariat" className={`${gold ? "btn-dark" : "btn-primary"} mt-7 w-full`}>Nous contacter</Link>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
          <p className="mt-8 flex items-center gap-2 text-sm text-white/65"><Megaphone size={16} className="shrink-0 text-lime" /> Chaque partenaire reçoit le nombre d'affichages et de clics de sa bannière.</p>
        </div>
      </section>
    </>
  );
}
