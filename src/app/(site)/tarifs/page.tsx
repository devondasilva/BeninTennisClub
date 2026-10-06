import Link from "next/link";
import { Check, Wallet, Smartphone, CalendarCheck, ShieldCheck, Wrench, Gift, ChevronRight } from "lucide-react";
import { db } from "@/db";
import { xof } from "@/lib/format";
import { LESSONS } from "@/lib/club";
import { getMemberships } from "@/lib/settings";
import PageHero, { PageBody, HeroPanel } from "@/components/site/PageHero";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";

export const metadata = { title: "Tarifs" };

export default async function TarifsPage() {
  const courts = db.courts.filter((c) => c.isActive);
  const MEMBERSHIPS = await getMemberships();
  return (
    <>
      <PageHero
        kicker="Saison 2026-2027"
        icon={<Wallet size={15} />}
        title="Nos"
        accent="tarifs"
        text="Adhésion, location de courts, cours et services. Paiement en ligne par MTN Mobile Money ou carte."
        image="/images/hero-night.svg"
        crumbs={[{ href: "/", label: "Accueil" }]}
        aside={
          <HeroPanel
            items={[
              { icon: <Smartphone size={18} />, text: "Paiement MTN Mobile Money ou carte bancaire" },
              { icon: <CalendarCheck size={18} />, text: "Réservation en ligne, créneaux de 30 minutes" },
              { icon: <ShieldCheck size={18} />, text: "Annulation gratuite jusqu'à 24 h avant" },
            ]}
          />
        }
      />

      <PageBody>
        <Reveal className="card p-7 md:p-10">
          <p className="eyebrow">Pour chaque profil</p>
          <h2 className="section-title mt-3">Adhésion annuelle</h2>
          <p className="mt-2 max-w-2xl text-muted">L'adhésion donne accès à la réservation des courts aux tarifs membres et aux avantages du club.</p>
          <Stagger className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {MEMBERSHIPS.map((m) => (
              <StaggerItem key={m.name} className="h-full">
                <div className={`relative flex h-full flex-col overflow-hidden rounded-[1.75rem] p-7 transition-all duration-300 hover:-translate-y-1 ${m.highlight ? "bg-ink text-white shadow-xl shadow-ink/25" : "border border-ink/[0.08] bg-mist hover:shadow-xl hover:shadow-brand/10"}`}>
                  {m.highlight && <div aria-hidden className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-lime/20 blur-3xl" />}
                  <span className={`chip relative w-fit font-bold ${m.highlight ? "bg-lime text-ink" : "bg-white text-ink/70"}`}>{m.tag}</span>
                  <h3 className={`relative mt-5 font-display text-2xl font-black ${m.highlight ? "text-white" : "text-ink"}`}>{m.name}</h3>
                  <p className="relative mt-2">
                    <span className={`font-display text-3xl font-black tracking-tight ${m.highlight ? "text-lime" : "text-brand"}`}>{xof(m.price)}</span>
                    <span className={m.highlight ? "text-white/60" : "text-muted"}> / {m.period}</span>
                  </p>
                  <ul className="relative mt-6 flex-1 space-y-2.5 text-sm">
                    {m.perks.map((p) => (
                      <li key={p} className="flex gap-2"><Check size={18} className={`shrink-0 ${m.highlight ? "text-lime" : "text-brand"}`} /><span className={m.highlight ? "text-white/80" : "text-ink/75"}>{p}</span></li>
                    ))}
                  </ul>
                  <Link href="/register" className={`${m.highlight ? "btn-accent" : "btn-primary"} relative mt-7 w-full`}>Choisir {m.name}</Link>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Reveal>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <Reveal className="card overflow-hidden">
            <div className="p-7 pb-5 md:p-8 md:pb-5">
              <p className="eyebrow">Jouer quand vous voulez</p>
              <h2 className="mt-2 font-display text-2xl font-black text-ink">Location de courts</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead><tr><th>Court</th><th>Surface</th><th className="text-right">30 min</th><th className="text-right">1 heure</th></tr></thead>
                <tbody>
                  {courts.map((c) => (
                    <tr key={c.id}>
                      <td className="font-semibold text-ink">{c.name}</td><td className="text-muted">{c.surface}</td>
                      <td className="tabular whitespace-nowrap text-right">{xof(c.pricePerSlot)}</td><td className="tabular whitespace-nowrap text-right font-bold text-brand">{xof(c.pricePerSlot * 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="border-t border-ink/[0.06] p-7 pt-5 text-sm text-muted md:px-8">Ouvert tous les jours de 6 h à minuit · réservation au moins un jour à l'avance · annulation gratuite jusqu'à 24 h avant.</p>
          </Reveal>
          <Reveal className="card overflow-hidden" delay={0.08}>
            <div className="p-7 pb-5 md:p-8 md:pb-5">
              <p className="eyebrow">Progresser</p>
              <h2 className="mt-2 font-display text-2xl font-black text-ink">Cours & stages</h2>
            </div>
            <ul className="divide-y divide-ink/[0.06] border-t border-ink/[0.06]">
              {LESSONS.map((l) => (
                <li key={l.name} className="flex items-center justify-between gap-4 px-7 py-4 md:px-8">
                  <div><p className="font-semibold text-ink">{l.name}</p><p className="text-sm text-muted">{l.detail}</p></div>
                  <span className="text-right text-sm font-bold text-ink sm:whitespace-nowrap">{l.price}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-ink/[0.06] px-7 py-5 md:px-8">
              <Link href="/coachs" className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand hover:text-ink">Tarif horaire de chaque coach <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" /></Link>
            </div>
          </Reveal>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <Reveal>
          <div className="card-hover group h-full p-8">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mist text-brand transition-all duration-500 group-hover:-rotate-6 group-hover:bg-brand group-hover:text-white"><Wrench size={22} /></span>
            <h2 className="mt-6 font-display text-2xl font-black text-ink">Cordage</h2>
            <p className="mt-2 text-muted">Pose et cordage inclus, délai 48 h.</p>
            <p className="mt-5 font-display text-4xl font-black tracking-tight text-ink">{xof(25000)}</p>
            <p className="text-sm text-muted">Option express 24 h : + {xof(5000)}</p>
            <Link href="/dashboard/stringing" className="btn-ghost mt-6">Déposer une raquette</Link>
          </div>
          </Reveal>
          <Reveal className="relative overflow-hidden rounded-[2rem] bg-lime p-8" delay={0.08}>
            <div aria-hidden className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-white/30 blur-2xl" />
            <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-lime"><Gift size={22} /></span>
            <h2 className="relative mt-6 font-display text-2xl font-black text-ink">Séance d'essai offerte</h2>
            <p className="relative mt-2 text-ink/75">Venez découvrir le club : une heure de court et le prêt de raquette offerts pour votre première visite.</p>
            <Link href="/contact" className="btn-dark relative mt-6">Réserver mon essai</Link>
          </Reveal>
        </div>
      </PageBody>
    </>
  );
}
