import Link from "next/link";
import { desc } from "drizzle-orm";
import { Check, ExternalLink, Eye, Users, Trophy, Megaphone } from "lucide-react";
import { db, t } from "@/db";
import { xof } from "@/lib/format";
import { activeFilter, partnerClickUrl, partnerImage, TIERS } from "@/lib/partners";
import PageHero from "@/components/site/PageHero";

export const metadata = { title: "Partenaires" };

const OFFERS = [
  { tier: "PLATINUM", price: 5000000, perks: ["Bannière sur tous les emplacements, diffusion prioritaire", "Nom associé à l'Open de Cotonou", "Logo sur les tenues des équipes du club", "4 courts privatisés par an pour vos équipes"] },
  { tier: "GOLD", price: 2500000, perks: ["Bannière sur l'accueil, les événements et l'espace membre", "Logo sur les panneaux des courts", "2 courts privatisés par an"] },
  { tier: "SILVER", price: 1000000, perks: ["Bannière sur les événements et la boutique", "Logo dans le bandeau partenaires du site"] },
  { tier: "PARTNER", price: 400000, perks: ["Bannière sur la boutique ou l'espace membre", "Logo dans le bandeau partenaires", "Offre réservée aux adhérents mise en avant"] },
];

export default async function PartnersPublicPage() {
  const partners = await db.query.partners.findMany({ where: activeFilter(), orderBy: desc(t.partners.amount) });
  return (
    <>
      <PageHero kicker="Ils nous font confiance" title="Nos partenaires" text="Le club grandit grâce aux entreprises qui soutiennent le tennis au Bénin. Merci à elles !" image="/images/events/tournament.svg" />

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {partners.map((p) => {
            const logo = partnerImage(p, "logo"), tier = TIERS[p.tier];
            return (
              <article key={p.id} id={p.id} className="flex scroll-mt-24 gap-5 rounded-2xl border border-slate-100 p-6 shadow-soft">
                <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-xl bg-slate-50 p-3">
                  {logo ? <img src={logo} alt={p.name} className="max-h-full max-w-full object-contain" /> : <span className="font-bold">{p.name}</span>}
                </div>
                <div className="flex flex-1 flex-col">
                  <span className={`chip w-fit ${tier?.color}`}>Partenaire {tier?.label}</span>
                  <h2 className="mt-2 text-lg font-bold text-primary-400">{p.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{p.description}</p>
                  {p.website && (
                    <a href={partnerClickUrl(p.id)} target="_blank" rel="noopener sponsored" className="mt-auto inline-flex w-fit items-center gap-1.5 pt-3 text-sm font-semibold text-primary-400 hover:underline">
                      Visiter le site <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="devenir-partenaire" className="scroll-mt-20 bg-primary-400">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-400">Devenir partenaire</p>
          <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">Associez votre marque au tennis béninois</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[[Users, "300+ membres", "et leurs familles, chaque semaine au club"], [Eye, "30 000+ affichages", "de bannières par an sur le site et l'application"], [Trophy, "5 événements", "par an, dont l'Open de Cotonou"]].map(([Icon, v, l]) => {
              const I = Icon as typeof Users;
              return (
                <div key={v as string} className="flex items-center gap-4 rounded-2xl bg-white/10 p-5">
                  <I className="text-accent-400" size={28} />
                  <div><p className="text-xl font-bold text-white">{v as string}</p><p className="text-sm text-slate-300">{l as string}</p></div>
                </div>
              );
            })}
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {OFFERS.map((o) => (
              <div key={o.tier} className={`flex flex-col rounded-3xl p-6 ${o.tier === "GOLD" ? "bg-accent-400" : "bg-white"}`}>
                <span className={`chip w-fit ${TIERS[o.tier].color}`}>{TIERS[o.tier].label}</span>
                <p className="mt-4 text-sm text-slate-500">à partir de</p>
                <p className="text-2xl font-extrabold text-primary-400">{xof(o.price)}<span className="text-sm font-medium text-slate-500"> / an</span></p>
                <ul className="mt-5 flex-1 space-y-2 text-sm">
                  {o.perks.map((p) => <li key={p} className="flex gap-2 text-slate-700"><Check size={17} className="shrink-0 text-primary-400" /> {p}</li>)}
                </ul>
                <Link href="/contact?sujet=Partenariat" className="btn-primary mt-6 w-full">Nous contacter</Link>
              </div>
            ))}
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm text-slate-300"><Megaphone size={16} className="text-accent-400" /> Chaque partenaire reçoit le nombre d'affichages et de clics de sa bannière.</p>
        </div>
      </section>
    </>
  );
}
