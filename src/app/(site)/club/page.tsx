import { eq } from "drizzle-orm";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { db, t } from "@/db";
import { BOARD, FACILITIES, HISTORY, VALUES } from "@/lib/club";
import PageHero from "@/components/site/PageHero";

export const metadata = { title: "Le club" };

export default async function ClubPage() {
  const courts = await db.query.courts.findMany({ where: eq(t.courts.isActive, true) });
  return (
    <>
      <PageHero kicker="Depuis 1998" title="Un club, une famille, une passion"
        text="Le Bénin Tennis Club accueille joueurs de tous âges et de tous niveaux à Akpakpa Dodomey, au cœur de Cotonou."
        image="/images/hero-clay.svg" />

      {/* Valeurs */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-primary-400">Notre mission</h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Rendre le tennis accessible au plus grand nombre au Bénin, former les champions de demain et offrir
              à chaque membre un lieu où progresser, se dépasser et partager.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[["300+", "membres"], ["28", "années"], ["200+", "enfants formés"]].map(([v, l]) => (
                <div key={l} className="rounded-2xl bg-primary-400 p-4"><p className="text-2xl font-extrabold text-accent-400">{v}</p><p className="text-xs text-slate-300">{l}</p></div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {VALUES.map((v, i) => (
              <div key={v.title} className="rounded-2xl border border-slate-100 p-6 shadow-soft">
                <span className="text-sm font-bold text-accent-700">0{i + 1}</span>
                <h3 className="mt-1 text-lg font-bold text-primary-400">{v.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Histoire */}
      <section className="bg-primary-400">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <h2 className="text-3xl font-bold text-white">Notre histoire</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3 lg:grid-cols-6">
            {HISTORY.map((h) => (
              <li key={h.year} className="relative border-t-2 border-accent-400 pt-5">
                <span className="absolute -top-[9px] left-0 h-4 w-4 rounded-full bg-accent-400" />
                <p className="text-2xl font-extrabold text-accent-400">{h.year}</p>
                <p className="mt-2 text-sm text-slate-300">{h.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Installations */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h2 className="text-3xl font-bold text-primary-400">Nos installations</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {courts.map((c) => (
            <div key={c.id} className="overflow-hidden rounded-2xl border border-slate-100 shadow-soft">
              <img src={c.image ?? ""} alt={c.name} className="aspect-[12/7] w-full object-cover" />
              <div className="p-5">
                <h3 className="font-bold text-primary-400">{c.name} · {c.surface}</h3><p className="mt-1 text-sm text-slate-500">{c.description}</p>
                <Link href={`/dashboard/reservations/new?court=${c.id}`} className="btn-accent mt-4 w-full">Réserver ce court</Link>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FACILITIES.map((f) => (
            <div key={f.title} className="flex gap-3 rounded-2xl bg-slate-50 p-5">
              <CheckCircle2 className="mt-0.5 shrink-0 text-accent-600" size={20} />
              <div><p className="font-semibold text-primary-400">{f.title}</p><p className="text-sm text-slate-500">{f.text}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* Bureau */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <h2 className="text-3xl font-bold text-primary-400">Le bureau du club</h2>
          <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
            {BOARD.map((b) => (
              <div key={b.name} className="rounded-2xl bg-white p-6 text-center shadow-soft">
                <img src={b.avatar} alt="" className="mx-auto h-24 w-24 rounded-full object-cover" />
                <p className="mt-4 font-bold text-primary-400">{b.name}</p>
                <p className="text-sm text-slate-500">{b.role}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-accent-400 p-8">
            <div><p className="text-2xl font-bold text-primary-400">Envie de nous rejoindre ?</p><p className="text-primary-400/80">Première séance d'essai offerte.</p></div>
            <div className="flex gap-3"><Link href="/tarifs" className="btn bg-white text-primary-400 hover:bg-slate-50">Voir les tarifs</Link><Link href="/register" className="btn-primary">Devenir membre</Link></div>
          </div>
        </div>
      </section>
    </>
  );
}
