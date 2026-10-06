import Link from "next/link";
import { Megaphone, ArrowRight } from "lucide-react";
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
          className="group relative block overflow-hidden rounded-2xl shadow-soft ring-1 ring-slate-100 transition hover:shadow-medium">
          <img src={ad.banner} alt={`${ad.name} — ${ad.tagline ?? ""}`} className="aspect-[4/1] w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
          <span className="absolute right-2 top-2 rounded bg-black/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">Partenaire</span>
        </a>
      </aside>
    );
  }
  return (
    <aside className={className} aria-label="Espace partenaire disponible">
      <Link href="/partenaires#devenir-partenaire"
        className={`group flex items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-accent-500 hover:bg-accent-50 ${variant === "wide" ? "p-6" : "flex-col p-5 text-center"}`}>
        <span className={`flex items-center gap-3 ${variant === "compact" ? "flex-col" : ""}`}>
          <span className="rounded-xl bg-white p-2.5 text-primary-400 shadow-soft"><Megaphone size={20} /></span>
          <span>
            <span className="block font-bold text-primary-400">Votre marque ici</span>
            <span className="text-sm text-slate-500">Touchez les 300+ membres du club et leurs familles.</span>
          </span>
        </span>
        <span className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-primary-400">Devenir partenaire <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
      </Link>
    </aside>
  );
}
