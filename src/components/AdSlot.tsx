import Link from "next/link";
import { Megaphone, ChevronRight } from "lucide-react";
import { pickAd } from "@/lib/partners";

/**
 * Emplacement publicitaire. Affiche la bannière d'un partenaire actif pour cet emplacement,
 * sinon une invitation « Votre marque ici ».
 */
export default async function AdSlot({ placement, variant = "wide", className = "" }: { placement: string; variant?: "wide" | "compact"; className?: string }) {
  const ad = await pickAd(placement);
  if (ad) {
    return (
      <aside className={className} aria-label="Partenaire du club">
        <a href={ad.href} target="_blank" rel="noopener sponsored" title={`${ad.name} : ${ad.tagline ?? "visiter le site"}`}
          className="group relative block overflow-hidden rounded-[2rem] border border-ink/[0.08] bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-brand/10">
          <img src={ad.banner} alt={`${ad.name} — ${ad.tagline ?? ""}`} className="aspect-[4/1] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <span className="absolute left-3 top-3 rounded-full bg-ink/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">Partenaire</span>
        </a>
      </aside>
    );
  }
  const compact = variant === "compact";
  return (
    <aside className={className} aria-label="Espace partenaire disponible">
      <Link href="/partenaires#devenir-partenaire"
        className={`group flex gap-4 rounded-[2rem] border-2 border-dashed border-ink/15 bg-white transition-colors duration-300 hover:border-brand/50 ${compact ? "flex-col items-center p-6 text-center" : "flex-wrap items-center justify-between p-6"}`}>
        <span className={`flex items-center gap-4 ${compact ? "flex-col" : ""}`}>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime/30 text-ink transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110"><Megaphone size={20} /></span>
          <span>
            <span className="block font-display text-lg font-black leading-tight text-ink">Votre marque ici</span>
            <span className="text-sm text-muted">Touchez les 300+ membres du club et leurs familles.</span>
          </span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs font-bold uppercase tracking-widest text-brand">Devenir partenaire <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" /></span>
      </Link>
    </aside>
  );
}
