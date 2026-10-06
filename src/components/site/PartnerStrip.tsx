import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { db } from "@/db";
import { activeFilter, partnerClickUrl, partnerImage } from "@/lib/partners";

/** Bandeau des logos des partenaires actifs (cliquables) */
export default async function PartnerStrip() {
  const partners = db.partners.filter(activeFilter());
  if (!partners.length) return null;
  return (
    <section className="border-t border-ink/[0.06] bg-white py-12">
      <div className="mx-auto max-w-content px-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-ink/50">Ils soutiennent le club</p>
          <Link href="/partenaires" className="group inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-brand hover:text-ink">
            Tous nos partenaires · Devenir partenaire <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {partners.map((p) => {
            const logo = partnerImage(p, "logo");
            return (
              <a key={p.id} href={partnerClickUrl(p.id)} target="_blank" rel="noopener sponsored" title={`Visiter ${p.name}`}
                className="group flex h-24 items-center justify-center rounded-[1.5rem] border border-ink/[0.08] bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/10">
                {logo ? (
                  <img src={logo} alt={p.name} className="max-h-full max-w-full object-contain opacity-70 grayscale transition-all duration-500 group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0" />
                ) : (
                  <span className="font-display font-black text-ink">{p.name}</span>
                )}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
