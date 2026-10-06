import { eq } from "drizzle-orm";
import Link from "next/link";
import { Check } from "lucide-react";
import { db, t } from "@/db";
import { xof } from "@/lib/format";
import { LESSONS } from "@/lib/club";
import { getMemberships } from "@/lib/settings";
import PageHero from "@/components/site/PageHero";

export const metadata = { title: "Tarifs" };

export default async function TarifsPage() {
  const [courts, MEMBERSHIPS] = await Promise.all([db.query.courts.findMany({ where: eq(t.courts.isActive, true) }), getMemberships()]);
  return (
    <>
      <PageHero kicker="Saison 2026-2027" title="Tarifs" text="Adhésion, location de courts, cours et services. Paiement en ligne par MTN Mobile Money ou carte." image="/images/hero-night.svg" />

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h2 className="text-3xl font-bold text-primary-400">Adhésion annuelle</h2>
        <p className="mt-2 text-slate-500">L'adhésion donne accès à la réservation des courts aux tarifs membres et aux avantages du club.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {MEMBERSHIPS.map((m) => (
            <div key={m.name} className={`relative flex flex-col rounded-3xl p-7 ${m.highlight ? "bg-primary-400 text-white shadow-medium" : "border border-slate-100 bg-white shadow-soft"}`}>
              <span className={`chip w-fit ${m.highlight ? "bg-accent-400 text-primary-400" : "bg-slate-100 text-slate-600"}`}>{m.tag}</span>
              <h3 className={`mt-4 text-xl font-bold ${m.highlight ? "text-white" : "text-primary-400"}`}>{m.name}</h3>
              <p className="mt-2"><span className={`text-3xl font-extrabold ${m.highlight ? "text-accent-400" : "text-primary-400"}`}>{xof(m.price)}</span><span className={m.highlight ? "text-slate-300" : "text-slate-400"}> / {m.period}</span></p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {m.perks.map((p) => (
                  <li key={p} className="flex gap-2"><Check size={18} className={`shrink-0 ${m.highlight ? "text-accent-400" : "text-accent-600"}`} /><span className={m.highlight ? "text-slate-200" : "text-slate-600"}>{p}</span></li>
                ))}
              </ul>
              <Link href="/register" className={`${m.highlight ? "btn-accent" : "btn-primary"} mt-7 w-full`}>Choisir {m.name}</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-primary-400">Location de courts</h2>
            <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-soft">
              <table className="table-base">
                <thead><tr><th>Court</th><th>Surface</th><th className="text-right">30 min</th><th className="text-right">1 heure</th></tr></thead>
                <tbody>
                  {courts.map((c) => (
                    <tr key={c.id}>
                      <td className="font-semibold text-primary-400">{c.name}</td><td className="text-slate-500">{c.surface}</td>
                      <td className="text-right">{xof(c.pricePerSlot)}</td><td className="text-right font-semibold">{xof(c.pricePerSlot * 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-slate-500">Ouvert tous les jours de 6 h à minuit · réservation au moins un jour à l'avance · annulation gratuite jusqu'à 24 h avant.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-primary-400">Cours & stages</h2>
            <ul className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-soft">
              {LESSONS.map((l) => (
                <li key={l.name} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div><p className="font-semibold text-primary-400">{l.name}</p><p className="text-sm text-slate-500">{l.detail}</p></div>
                  <span className="whitespace-nowrap text-right text-sm font-semibold">{l.price}</span>
                </li>
              ))}
            </ul>
            <Link href="/coachs" className="mt-3 inline-block text-sm font-semibold text-primary-400 underline">Tarif horaire de chaque coach →</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-100 p-7 shadow-soft">
            <h2 className="text-xl font-bold text-primary-400">Cordage</h2>
            <p className="mt-2 text-slate-500">Pose et cordage inclus, délai 48 h.</p>
            <p className="mt-4 text-3xl font-extrabold text-primary-400">{xof(25000)}</p>
            <p className="text-sm text-slate-500">Option express 24 h : + {xof(5000)}</p>
            <Link href="/dashboard/stringing" className="btn-ghost mt-5">Déposer une raquette</Link>
          </div>
          <div className="rounded-3xl bg-accent-400 p-7">
            <h2 className="text-xl font-bold text-primary-400">Séance d'essai offerte</h2>
            <p className="mt-2 text-primary-400/80">Venez découvrir le club : une heure de court et le prêt de raquette offerts pour votre première visite.</p>
            <Link href="/contact" className="btn-primary mt-5">Réserver mon essai</Link>
          </div>
        </div>
      </section>
    </>
  );
}
