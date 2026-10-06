import Link from "next/link";
import { db } from "@/db";
import { activeFilter, partnerClickUrl, partnerImage } from "@/lib/partners";

/** Bandeau des logos des partenaires actifs (cliquables) */
export default async function PartnerStrip() {
  const partners = await db.query.partners.findMany({ where: activeFilter() });
  if (!partners.length) return null;
  return (
    <section className="border-t border-slate-100 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Ils soutiennent le club</p>
          <Link href="/partenaires" className="text-sm font-semibold text-primary-400 hover:underline">Tous nos partenaires · Devenir partenaire →</Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          {partners.map((p) => {
            const logo = partnerImage(p, "logo");
            return (
              <a key={p.id} href={partnerClickUrl(p.id)} target="_blank" rel="noopener sponsored" title={`Visiter ${p.name}`}
                className="flex h-24 items-center justify-center rounded-xl border border-slate-100 bg-white p-3 grayscale transition hover:border-accent-500 hover:shadow-soft hover:grayscale-0">
                {logo ? <img src={logo} alt={p.name} className="max-h-full max-w-full object-contain" /> : <span className="font-bold text-primary-400">{p.name}</span>}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
